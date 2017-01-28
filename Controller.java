@Controller
@RequestMapping("/sms")
public class SmsPController {

    @ResponseBody
    @RequestMapping("/doCreate")
    public int create(HttpServletRequest request, @Valid SmsTaskReq smsTaskReq, @RequestParam(value = "telsFile", required = false) MultipartFile telsFile,
                      @RequestParam(value = "midsFile", required = false) MultipartFile midsFile) throws IOException {
        SmsTask smsTask = new SmsTask();
        BeanUtils.copyProperties(smsTaskReq, smsTask);
        int result = smsTaskService.saveOrUpdate(smsTask);

        String filePath = (FilePathConstants.DEFAULT_UPLOAD_FILE_PATH);

        String destFileName = getFilePath(filePath, midsFile, telsFile,smsTask);

        smsScheduledTaskService.asyAddDBByFile(filePath + FilePathConstants.DEFAULT_DELIMITER + destFileName, smsTask);

        //生成并处理模板
        smsTemplateService.handleTemplate(smsTask);

        return result;
    
}