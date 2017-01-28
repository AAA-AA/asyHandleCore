$(function () {
    var $table = $('#biliTable');
    var _table = $table.dataTable($.extend(true, {},
        CONSTANT.DATA_TABLES.DEFAULT_OPTION, {
            ajax: function (data, callback, settings) {//ajax配置为function,手动调用异步查询
                //封装请求参数
                var param = userManage.getQueryCondition(data);
                $.ajax({
                    type: "GET",
                    url: "/sms/listArray",
                    cache: false,	//禁用缓存
                    data: param,	//传入已封装的参数
                    dataType: "json",
                    success: function (result) {
                        if (result.errorCode) {
                            alert("查询失败。错误码：" + result.errorCode);
                            return;
                        }
                        var returnData = {};
                        returnData.draw = data.draw;
                        returnData.recordsTotal = result.total;
                        returnData.recordsFiltered = result.total;
                        returnData.data = result.pageData;
                        //调用DataTables提供的callback方法，代表数据已封装完成并传回DataTables进行渲染
                        //此时的数据需确保正确无误，异常判断应在执行此回调前自行处理完毕
                        callback(returnData);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        alert("查询失败");
                    }
                });
            },
            columns: [
                {
                    data: "id",
                    render: CONSTANT.DATA_TABLES.RENDER.ELLIPSIS
                },
                {
                    data: "taskName",
                    render: CONSTANT.DATA_TABLES.RENDER.ELLIPSIS
                },
                {
                    data: "ctime",
                    render: CONSTANT.DATA_TABLES.RENDER.TIMESTEMP
                },
                {
                    data: "mtime",
                    render: CONSTANT.DATA_TABLES.RENDER.TIMESTEMP
                },
                {
                    data: "smsSendTime",
                    render: CONSTANT.DATA_TABLES.RENDER.TIMESTEMP
                },
                {
                    data: "smsAmount",
                    render: CONSTANT.DATA_TABLES.RENDER.ELLIPSIS
                },
                {
                    data: "smsStarter",
                    render: CONSTANT.DATA_TABLES.RENDER.ELLIPSIS
                },
                {
                    data: "status",
                    render: CONSTANT.DATA_TABLES.RENDER.DBSTATUS
                },
                {
                    data: "taskStatus",
                    render: CONSTANT.DATA_TABLES.RENDER.TASKSTATUS
                },
                {
                    data: "auditStatus",
                    render: CONSTANT.DATA_TABLES.RENDER.AUDITSTATUS
                },
                {
                    data: null,
                    defaultContent: "",
                    orderable: false,
                    width: "120px"
                },
                {
                    data: null,
                    defaultContent: "",
                    orderable: false,
                    width: "120px"
                }
            ],
            "createdRow": function (row, data, index) {
                if (data.role) {
                    $(row).addClass("info");
                }
                //给当前行某列加样式
                $('td', row).eq(3).addClass(data.status ? "text-success" : "text-error");
                //不使用render，改用jquery文档操作呈现单元格
                var edit = '<button type="button" class="btn btn-success btn-edit">编辑</button>';
                var cancel = '<button type="button" class="btn btn-warning btn-cancel">作废</button>';
                var $option = $('<div>'+edit+cancel+'</div>');
                var btnPass = '<button type="button" class="btn btn-small btn-success btn-pass">通过</button>';
                var reject = '<button type="button" class="btn btn-warning btn-reject">驳回</button>';
                var $option2 = $('<div>'+btnPass+reject+'</div>');
                $('td', row).eq(-1).append($option2);
                $('td', row).eq(-2).append($option);

            }
        })).api();

    $("#btn-edit").click(function () {
        userManage.editItemInit();
    });

    $("#btn-simple-search").click(function () {
        userManage.openSearch = true;
        _table.draw(false);
    });

    $("#btn-add").click(function () {
        userManage.addItemInit();
    });


    //行点击事件
    $("tbody", $table).on("click", "tr", function (event) {
        $(this).addClass("active").siblings().removeClass("active");
        //获取该行对应的数据
        var item = _table.row($(this).closest('tr')).data();
        userManage.currentItem = item;
    }).on("click", ".btn-edit", function () {
        //点击编辑按钮
        var item = _table.row($(this).closest('tr')).data();
        $(this).closest('tr').addClass("active").siblings().removeClass("active");
        userManage.currentItem = item;
        userManage.editItemInit(item, _table);
    }).on("click", '.btn-cancel', function () {
        //点击作废按钮
        var item = _table.row($(this).closest('tr')).data();
        $(this).closest('tr').addClass("active").siblings().removeClass("active");
        userManage.deleteItem(item, _table);
    }).on("click", '.btn-pass', function () {
        //点击通过按钮
        var item = _table.row($(this).closest('tr')).data();
        $(this).closest('tr').addClass("active").siblings().removeClass("active");
        userManage.passItem(item, _table);
    }).on("click", '.btn-reject', function () {
        //点击驳回按钮
        var item = _table.row($(this).closest('tr')).data();
        $(this).closest('tr').addClass("active").siblings().removeClass("active");
        userManage.rejectItem(item, _table);
    });

});
var userManage = {
    currentItem: null,
    openSearch: true,
    getQueryCondition: function (data) {
        var param = {};
        //组装排序参数
        if (data.order && data.order.length && data.order[0]) {
            switch (data.order[0].column) {
                case 1:
                    param.orderColumn = "id";
                    break;
                case 2:
                    param.orderColumn = "taskName";
                    break;
                case 3:
                    param.orderColumn = "ctime";
                    break;
                case 4:
                    param.orderColumn = "mtime";
                    break;
                case 5:
                    param.orderColumn = "smsSendTime";
                    break;
                case 6:
                    param.orderColumn = "smsAmount";
                    break;
                case 7:
                    param.orderColumn = "smsStarter";
                    break;
                case 8:
                    param.orderColumn = "taskStatus";
                    break;
                case 9:
                    param.orderColumn = "auditStatus";
                    break;
                default:
                    param.orderColumn = "id";
                    break;
            }
            param.orderDir = data.order[0].dir;
        }
        //组装查询参数
        param.openSearch = userManage.openSearch;
        if (userManage.openSearch) {
            param.taskName = $(".query-key[name='s_taskName']").val();
            param.smsStarter = $(".query-key[name='s_smsStarter']").val();
            param.bizType = $(".query-key[name='s_bizType']").val();
            param.startTime = $(".query-key[name='s_startTime']").val();
            param.endTime = $(".query-key[name='s_endTime']").val();
            param.auditStatus = $(".query-key[name='s_auditStatus']").val();
        }
        //组装分页参数
        param.startIndex = data.start;
        param.pageSize = data.length;
        param.draw= data.draw;
        return param;
    },
    addItemInit: function () {
        $('#addSmsTaskModel').modal();
        $(".add-info").unbind('click').on('click', function (e) {
            // 异步提交
            $('#addForm').ajaxSubmit(addOptions);
        });
    },
    editItemInit: function (item, _table) {
        if(!validateWithEdit(item)) {
            return;
        }
        $('#u_id').val(item.id);
        $('#u_taskName').val(item.taskName);
        $('#u_bizType option[value='+item.bizType+']').attr("selected",true);
        $('#u_smsSendTime').val(new Date(item.smsSendTime).format('yyyy-MM-dd hh:mm:ss'));
        $(".u-smsSourceType[value="+item.smsSourceType+"]").attr("checked",true)
        $("#u_smsContent").val(item.smsContent);
        $("#editSmsTaskModel").modal();
        $('.u-update-info').click(function () {
            // 异步提交
            $('#updateForm').ajaxSubmit(updateOptions)
            _table.draw(false)
        });
    },
    deleteItem: function (item, _table) {
        if(!validateWithCancel(item)) {
            return ;
        }
        if (confirm('确认作废么?')) {
            $.post('/sms/cancel',{
                'id': item.id
            }, function(data){
                if(typeof data ==='number' &&data){
                    alert("作废成功！")
                    _table.draw(false);
                }else
                    alert('操作失败！')
            });
        }
    },
    passItem: function (item,_table) {
        if(!validateWithPass(item)) {
            return ;
        }
        if(confirm('确认通过吗？')) {
            $.post('/sms/audit',{
                'id': item.id,'operation':'pass'
            },function (data) {
                if(typeof data ==='number' && data == 1){
                    alert('操作成功！')
                    _table.draw(false);
                }else
                    alert('操作失败！');
            })
        }
    },
    rejectItem: function (item,_table) {
        if(!validateWithReject(item)) {
            return ;
        }
        if(confirm('确认驳回吗？')) {
            $.post('/sms/audit',{
                'id': item.id,'operation':'reject'
            },function (data) {
                if(typeof data ==='number' && data == 1){
                    alert('驳回成功！')
                    _table.draw(false);
                }else
                    alert('操作失败！')
            })
        }
    }
};
var addOptions = {
    _table : null,
    url: '/sms/doCreate',
    beforeSubmit: validate,
    success: showResponse,
    complete: function (xhr) {
        if (xhr.status != 200 && xhr.status != 0) {
            console.log(xhr.responseText)
            alert("上传失败！")
        }
    }
}
var updateOptions = {
    url: '/sms/doUpdate',
    beforeSubmit: validate2,
    success: showResponse2,
    complete: function (xhr) {
        if (xhr.status != 200 && xhr.status != 0) {
            console.log(xhr.responseText)
            alert("上传失败！")
        }
    }
}
//
// 校验
//
function validate(formData, jqForm, options) {
    var smsTask = {};

    smsTask.smsStarter = $('#smsStarter').val();
    smsTask.taskName = $('#taskName').val();
    smsTask.isAct = $('#isAct').val();
    smsTask.bizType = $('#bizType').val();
    smsTask.smsSendTime = $('#smsSendTime').val();
    smsTask.smsSourceType = $("input[name='smsSourceType']:checked").val();
    smsTask.smsContent = $('#smsContent').val();
    smsTask.midsFile = $('#midsFile').val();
    smsTask.telsFile = $('#telsFile').val();
    if(commonTools.isUnderfindOrEmpty(smsTask.taskName)) {
        alert("任务名称不能为空！")
        return false;
    }
    if(commonTools.isUnderfindOrEmpty(smsTask.telsFile) && commonTools.isUnderfindOrEmpty(smsTask.midsFile)) {
        alert("至少上传一个文件！")
        return false;
    }
    if(!commonTools.checkDateTime(smsTask.smsSendTime)) {
        alert("时间格式不符合规范！格式为yyyy-MM-dd HH:mm:ss")
        return false;
    }
    if(!commonTools.checkLength(5,200,smsTask.smsContent)) {
        alert("内容请在5至200以内！")
        return false;
    }

    return true;
}

function validate2(formData, jqForm, options) {
    var smsTask = {};

    smsTask.smsStarter = $('#u_smsStarter').val();
    smsTask.taskName = $('#u_taskName').val();
    smsTask.isAct = $('#u_isAct').val();
    smsTask.bizType = $('#u_bizType').val();
    smsTask.smsSendTime = $('#u_smsSendTime').val();
    smsTask.smsContent = $('#u_smsContent').val();
    smsTask.midsFile = $('#u_midsFile').val();
    smsTask.telsFile = $('#u_telsFile').val();
    if(commonTools.isUnderfindOrEmpty(smsTask.taskName)) {
        alert("任务名称不能为空！")
        return false;
    }
    if(commonTools.isUnderfindOrEmpty(smsTask.telsFile) && commonTools.isUnderfindOrEmpty(smsTask.midsFile)) {
        alert("至少上传一个文件！")
        return false;
    }
    if(!commonTools.checkDateTime(smsTask.smsSendTime)) {
        alert("时间格式不符合规范！格式为yyyy-MM-dd HH:mm:ss")
        return false;
    }
    if(!commonTools.checkLength(5,200,smsTask.smsContent)) {
        alert("内容请在5至200以内！")
        return false;
    }

    return true;
}
//
function showResponse(data) {
    if(typeof data === 'string' && data.indexOf("call admin") >= 0) {
        alert("创建失败！")
        $('#addSmsTaskModel').modal('hide');
    }else {
        $('#addSmsTaskModel').modal('hide');
        alert("创建成功！")
        location.reload(true)
    }

}
function showResponse2(data) {
    if(typeof data === 'string' && data.indexOf("call admin") >= 0) {
        alert("创建失败！")
        $('#editSmsTaskModel').modal('hide');
    }else {
        alert("创建成功！")
        $('#editSmsTaskModel').modal('hide');
    }
}
function validateWithCancel(item) {
    if(item.taskStatus==3) {
        alert("任务已发送，不可再作废！")
        return false;
    }
    if(item.taskStatus==-1) {
        alert("任务已作废，无需再作废！")
        return false;
    }
    if(item.auditStatus==2) {
        alert("已处于驳回状态，无需再作废！")
        return false;
    }
    return true;

}

function validateWithPass(item) {
    if(item.taskStatus==-1) {
        alert("任务已作废，无需再执行通过操作！")
        return false;
    }
    if(item.auditStatus==1) {
        alert("已处于通过状态，无需重复执行通过操作！")
        return false;
    }
    return true;

}
function validateWithReject(item) {
    if(item.taskStatus==-1) {
        alert("任务已作废，无需再驳回！")
        return false;
    }
    if(item.auditStatus==2) {
        alert("已处于驳回状态，无需再驳回！")
        return false;
    }
    return true;
}
function validateWithEdit(item) {
    if(item.auditStatus==1) {
        alert("任务处于通过状态，不可再编辑！")
        return false;
    }
    return true;
}