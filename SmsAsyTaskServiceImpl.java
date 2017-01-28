package com.bilibili.sms.service.service.impl;

import com.bilibili.common.enums.SmsSendCountEnum;
import com.bilibili.common.enums.SmsSendStatusEnum;
import com.bilibili.common.utils.ValidUtils;
import com.bilibili.sms.persist.dto.thrid.UserInfo;
import com.bilibili.sms.persist.model.SmsSendSource;
import com.bilibili.sms.persist.model.SmsTask;
import com.bilibili.sms.service.service.SmsScheduledTaskService;
import com.bilibili.sms.service.service.SmsSendSourceService;
import com.bilibili.sms.service.service.SmsTaskService;
import com.bilibili.sms.service.service.UserInfoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.sql.Timestamp;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * USER : renhongqiang
 * DATE : 2017/1/11
 * TIME : 17:16
 */
@Service
public class SmsScheduledTaskServiceImpl implements SmsScheduledTaskService {

    private static ExecutorService executorService = Executors.newFixedThreadPool(5);

    private Logger LOGGER = LoggerFactory.getLogger(SmsScheduledTaskServiceImpl.class);

    @Autowired
    private SmsTaskService smsTaskService;

    @Autowired
    private UserInfoService userInfoService;

    @Autowired
    private SmsSendSourceService smsSendSourceService;

    @Override
    public int save(SmsSendSource smsSendSource) {

        return smsSendSourceService.saveOrUpdate(smsSendSource);
    }

    public void asyAddDBByFile(String filePath, SmsTask smsTask) {

        executorService.submit(new Callable<String>() {
            @Override
            public String call() throws Exception {
                try {
                    InsertIntoDbWithFile(filePath, smsTask);
                    LOGGER.info(String.format("异步创建任务成功!任务信息：%s",smsTask.toString()));
                    return "ok";
                }catch (Exception e) {
                    LOGGER.error(String.format("异步创建任务失败！失败任务信息：%s,异常信息：%s",smsTask.toString(),e),e);
                    return "error";
                }
            }
        });
    }


    /***
     * 异步读取文件并设置任务
     * @param filePath
     * @param smsTask
     * @throws IOException
     */
    public void InsertIntoDbWithFile(String filePath, SmsTask smsTask) throws IOException {
        File destFile = null;
        try {
            destFile = new File(filePath);
            if (destFile != null && destFile.getName().contains("mids")) {
                FileReader fileReader = new FileReader(destFile);
                BufferedReader bufferedReader = new BufferedReader(fileReader);
                String mid = "";
                while (ValidUtils.isNotNullOrEmpty(mid = bufferedReader.readLine())) {
                    if (ValidUtils.isNotNullOrEmpty(mid)) {
                        InsertDBByMid(mid, smsTask);
                    } else {
                        return;
                    }
                }
            }
            if (destFile != null && destFile.getName().contains("tels")) {
                FileReader fileReader = new FileReader(destFile);
                BufferedReader bufferedReader = new BufferedReader(fileReader);
                String tel = "";
                while (ValidUtils.isNotNullOrEmpty(tel = bufferedReader.readLine())) {
                    InsertDBByTels(tel, smsTask);
                }
            }
            smsTask.setSmsAmount(smsSendSourceService.getCountByType(smsTask.getTaskName(),SmsSendCountEnum.待发送总数.code));
            smsTaskService.update(smsTask);
        } catch (FileNotFoundException e) {
                LOGGER.error(String.format("文件未找到:%s", e));
                throw e;
        } catch (IOException e) {
                LOGGER.error(String.format("文件读取错误:", e),e);
                throw e;
        }
    }

    private void InsertDBByTels(String tels, SmsTask smsTask) {
        SmsSendSource smsSendSource = new SmsSendSource();
        smsSendSource.setTelNo(tels);
        smsSendSource.setLinkTaskName(smsTask.getTaskName());
        smsSendSource.setSmsSendTime(new Timestamp(smsTask.getSmsSendTime().getTime()));
        smsSendSource.setContent(smsTask.getSmsContent());
        smsSendSourceService.saveOrUpdate(smsSendSource);
        LOGGER.info(String.format("insert msg %s", smsSendSource.toString()));

    }

    private void InsertDBByMid(String mid, SmsTask smsTask) {
        UserInfo userInfo = userInfoService.getUserInfo(mid);
        SmsSendSource smsSendSource = new SmsSendSource();
        smsSendSource.setLinkTaskName(smsTask.getTaskName());
        smsSendSource.setSmsSendTime(new Timestamp(smsTask.getSmsSendTime().getTime()));
        smsSendSource.setMid(Integer.valueOf(mid));
        smsSendSource.setContent(smsTask.getSmsContent());
        if (ValidUtils.isNullOrEmpty(userInfo) || ValidUtils.isNullOrEmpty(userInfo.getTelNo())) {
            smsSendSource.setSmsSendStatus(SmsSendStatusEnum.未绑定手机号.code);
        } else {
            smsSendSource.setTelNo(userInfo.getTelNo());
        }
        smsSendSourceService.saveOrUpdate(smsSendSource);
        LOGGER.info(String.format("insert msg %s", smsSendSource.toString()));
        //asyDBSmsSendSource(smsSendSource);
    }

    @Override
    public void asyUpDateDBByFile(String filePath, SmsTask smsTask,SmsTask oldTask) {

        executorService.submit(new Callable<String>() {
            @Override
            public String call() throws Exception {
                try {
                    smsSendSourceService.deleteByTaskName(oldTask);
                    InsertIntoDbWithFile(filePath, smsTask);
                    LOGGER.info(String.format("异步更新任务成功！原有任务：%s,更新后任务：%s",oldTask.toString(),smsTask.toString()));
                    return "ok";
                }catch (Exception e) {
                    LOGGER.error(String.format("异步更新任务失败！原有任务：%s,更新后任务：%s,异常信息：%s",oldTask.toString(),smsTask.toString(),e),e);
                    return "error";
                }
            }
        });
    }

    @Override
    public void cancel(SmsTask oldSmsTask) {

        executorService.submit(new Callable<String>() {
            @Override
            public String call() {
                try {
                    smsSendSourceService.deleteByTaskName(oldSmsTask);
                    LOGGER.info(String.format("异步废除任务成功！:%s",oldSmsTask.toString()));
                    return "ok";
                }catch (Exception e) {
                    LOGGER.error(String.format("异步废除任务失败！失败任务：%s；失败信息：%s",oldSmsTask.toString(),e),e);
                    return "error";
                }
            }
        });

    }

    @Override
    public void audit(Integer auditCode, SmsTask oldSmsTask) {
        executorService.submit(new Callable<String>() {
            @Override
            public String call(){
                try {
                    smsSendSourceService.updateAuditStatus(auditCode,oldSmsTask);
                    LOGGER.info(String.format("异步更新审计状态成功！:%s",oldSmsTask.toString()));
                    return "ok";
                }catch (Exception e) {
                    LOGGER.error(String.format("异步更新审计状态失败！失败任务：%s；失败信息：%s",oldSmsTask.toString(),e),e);
                    return "error";
                }

            }
        });
    }
}

