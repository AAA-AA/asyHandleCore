/*常量*/
var CONSTANT = {
		DATA_TABLES : {
			DEFAULT_OPTION : { //DataTables初始化选项
				language: {
					"sProcessing":   "处理中...",
					"sLengthMenu":   "每页 _MENU_ 项",
					"sZeroRecords":  "没有匹配结果",
                    "aLengthMenu": [20, 50, 100],
					"sInfo":         "当前显示第 _START_ 至 _END_ 项，共 _TOTAL_ 项。",
					"sInfoEmpty":    "当前显示第 0 至 0 项，共 0 项",
					"sInfoFiltered": "(由 _MAX_ 项结果过滤)",
					"sInfoPostFix":  "",
					"sSearch":       "搜索:",
					"sUrl":          "",
					"sEmptyTable":     "表中数据为空",
					"sLoadingRecords": "载入中...",
					"sInfoThousands":  ",",
					"oPaginate": {
						"sFirst":    "首页",
						"sPrevious": "上页",
						"sNext":     "下页",
						"sLast":     "末页",
						"sJump":     "跳转"
					},
					"oAria": {
						"sSortAscending":  ": 以升序排列此列",
						"sSortDescending": ": 以降序排列此列"
					}
				},
                "aButtons":true,
                autoWidth: true,
                stripeClasses: ["odd", "even"],
                order: [],
                processing: false,
                serverSide: true,
                searching: false
			},
            RENDER: {	//常用render可以抽取出来，如日期时间、头像等
                STATUS: function (data, type, row, meta) {
                    if(0 == data){
                        return "成功";
                    }else {
                        return "失败";
                    }
                },
                ELLIPSIS: function (data, type, row, meta) {
                	data = data||"";
                	return '<span title="' + data + '">' + data + '</span>';
                },
                TIMESTEMP: function(data, type, row, meta){
                    var newDate = new Date();
                    newDate.setTime(data);
                    return newDate.format('yyyy-MM-dd hh:mm:ss');
                },
				TASKSTATUS: function (data, type, row, meta) {
					if(data==-1) {
						return '<span style="color: #dd4b39; title="' + data + '">已作废</span>';
					}
					if(data==1) {
						return '<span style="color: rgba(83, 0, 239, 0.84); title="' + data + '">待发送</span>';
					}
					if(data==2) {
						return '<span title="' + data + '">发送中</span>';
					}
					if(data==3) {
						return '<span style="color: #00ef1f; title="' + data + '">已发送</span>';
					}
				},
				AUDITSTATUS: function (data, type, row, meta) {
					if(data==-1) {
						return '<span style="color: rgba(83, 0, 239, 0.84); title="' + data + '">未处理</span>';
					}
					if(data==1) {
						return '<span style="color: #00ef1f; title="' + data + '">通过</span>';
					}
					if(data==2) {
						return '<span style="color: #dd4b39; title="' + data + '">已驳回</span>';
					}
				},
				DBSTATUS:function (data, type, row, meta) {
					if(data==2) {
						return '<span style="color: #dd4b39; title="' + data + '">入库中</span>';
					}
					if(data==3) {
						return '<span style="color: #00ef1f; title="' + data + '">入库完成</span>';
					}else {
						return '<span style="color: #dd4b39; title="' + data + '">入库中 </span>';
					}
				}
            }
		}
};