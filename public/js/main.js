"use strict";
var app = angular.module('EventApp',[]);

app.config(function ($httpProvider) {
	$httpProvider.defaults.transformRequest = function(data){
		if (data === undefined)
			return data;
		return $.param(data);
	};
});

app.service('DateStringify',function(){
	return {
		'long'    : ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
		'weekday' : ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],

		'getLong' : function(index){
			return index > 11 || index < 0 ? '' : this.long[index];
		},
		'getWeek' : function(index){
			return index > 6 || index < 0 ? '' : this.weekday[index];
		},
		'zerofill' : function(number){
			return number < 10 ? ("0"+number) : number;
		}
	}
});

app.controller('CalendarCtrl',['$scope','$timeout','$rootScope','$http','DateStringify', function($scope, $timeout, $rootScope, $http, $dateStringify){

	$scope.view = {
		'animateTiming' : 0,
		'visible'       : true,
		'details'       : true,
	};

	$scope.now = {
		'date'         : null,
		'monthName'    : null,
		'todayYear'    : null,
		'todayMonth'   : null,
		'todayDay'     : null,
		'firstDay'     : null,
		'firstWeek'    : null,
		'lastDay'      : null,
		'lastWeek'     : null,
		'selectedTime' : null,
		'selectedDate' : null,
		'calendar'     : []
	};

	$scope.eventlist = [];

	$scope.selectedMonth = function(){
		return $dateStringify.getLong($scope.now.selectedDate.getMonth());
	}

	$scope.getWeekName = function(weekday){
		return $dateStringify.getWeek(weekday);
	};

	$scope.setMonth = function(y, m){
		var date     = new Date(y,m,1);
		var year     = date.getFullYear();
		var month    = date.getMonth();
		var today    = date.getDate();
		var firstDay = new Date(year,month,0)
		var lastDay  = new Date(year,month+1,0)

		$scope.now.date       = date,
		$scope.now.monthName  = $dateStringify.getLong(month),
		$scope.now.todayYear  = year,
		$scope.now.todayMonth = month,
		$scope.now.todayDay   = new Date().getDate(),
		$scope.now.firstDay   = firstDay.getDate(),
		$scope.now.firstWeek  = firstDay.getDay(),
		$scope.now.lastDay    = lastDay.getDate(),
		$scope.now.lastWeek   = lastDay.getDay(),
		$scope.now.calendar   = []
	};

	$scope.select = function(dateinfo){
		var newDate = new Date(dateinfo[0],dateinfo[1],dateinfo[2]);
		$scope.view.details = false;
		$timeout(function(){
			$scope.now.selectedDate = newDate;
			$rootScope.selectedDate = newDate;
			$scope.view.details = true;
			$scope.loadEventsOnDate(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
		},$scope.view.animateTiming);
		$scope.now.selectedTime = newDate.getTime();
		if(dateinfo[3] === -1)
			$scope.prevMonth();
		else if(dateinfo[3] === 1)
			$scope.nextMonth();
	};

	$scope.buildCalendar = function(){
		var currentDay = 1;
		var week       = [];
		var today      = new Date();
		var dateUsed   = null;

		today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		for(var i = $scope.now.firstWeek; i>=0; i--){
			dateUsed = new Date($scope.now.todayYear, $scope.now.todayMonth - 1, $scope.now.firstDay - i);
			week.push({
				'otherMonth' : true,
				'date'       : [dateUsed.getFullYear(),dateUsed.getMonth(),dateUsed.getDate(),-1],
				'isToday'    : dateUsed.getTime() == today.getTime(),
				'timestamp'  : dateUsed.getTime(),
				'day'        : $scope.now.firstDay - i,
				'hasEvent'   : false
			});
		}

		if(week.length === 7){
			$scope.now.calendar.push(week);
			week = [];
		}

		while(currentDay <= $scope.now.lastDay){
			dateUsed = new Date($scope.now.todayYear, $scope.now.todayMonth, currentDay);
			week.push({
				'otherMonth' : false,
				'date'       : [dateUsed.getFullYear(),dateUsed.getMonth(),dateUsed.getDate(),0],
				'isToday'    : dateUsed.getTime() == today.getTime(),
				'timestamp'  : dateUsed.getTime(),
				'day'        : currentDay++,
				'hasEvent'   : false
			});
			if(week.length === 7){
				$scope.now.calendar.push(week);
				week = [];
			}
		}

		currentDay = 1;


		for(var i = $scope.now.lastWeek === 6 ? -1 : $scope.now.lastWeek; i < 6; i++){
			dateUsed = new Date($scope.now.todayYear, $scope.now.todayMonth + 1, currentDay);
			week.push({
				'otherMonth' : true,
				'date'       : [dateUsed.getFullYear(),dateUsed.getMonth(),dateUsed.getDate(),1],
				'isToday'    : dateUsed.getTime() == today.getTime(),
				'timestamp'  : dateUsed.getTime(),
				'day'        : currentDay++,
				'hasEvent'   : false
			});
		}

		if(week.length > 0)
			$scope.now.calendar.push(week);

		$scope.requestEventsByDay();
	};

	$scope.initialize = function(){
		var now = new Date();
		$rootScope.loadingEvents = 0;

		$scope.now.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		$rootScope.selectedDate = $scope.now.selectedDate;
		$scope.now.selectedTime = $scope.now.selectedDate.getTime();
		$scope.setMonth(now.getFullYear(), now.getMonth());
		$scope.buildCalendar();

		$scope.loadEventsOnDate(now.getFullYear(), now.getMonth(), now.getDate());
	};

	$scope.prevMonth = function(){
		$scope.view.visible = false;
		$timeout(function(){
			$scope.now.todayMonth--;
			if($scope.now.todayMonth < 0){
				$scope.now.todayMonth = 11
				$scope.now.todayYear--;
			}
			$scope.setMonth($scope.now.todayYear, $scope.now.todayMonth);
			$scope.buildCalendar();
			$timeout(function(){
				$scope.view.visible = true;
			},1);
		},$scope.view.animateTiming);
	};

	$scope.nextMonth = function(){
		$scope.view.visible = false;
		$timeout(function(){
			$scope.now.todayMonth++;
			if($scope.now.todayMonth > 11){
				$scope.now.todayMonth = 0
				$scope.now.todayYear++;
			}
			$scope.setMonth($scope.now.todayYear, $scope.now.todayMonth);
			$scope.buildCalendar();
			$timeout(function(){
				$scope.view.visible = true;
			},1);
		},$scope.view.animateTiming);
	};

	$scope.openAddForm = function(){
		var day   = $dateStringify.zerofill($rootScope.selectedDate.getDate());
		var month = $dateStringify.zerofill($rootScope.selectedDate.getMonth() + 1);
		var year  = $dateStringify.zerofill($rootScope.selectedDate.getFullYear());
		$rootScope.$broadcast("modalBehaviorOpen",'MODAL_EVENT');
		$rootScope.$broadcast("modalLoadData",{
			"eventdate":day+"/"+month+"/"+year,
			"eventtime":"00:00",
			"remind": 2,
			"participants":[]
		});
	};

	$scope.openConfig = function(){
		$rootScope.$broadcast("modalBehaviorOpen",'MODAL_CONFIG');
	}

	$scope.editEvent = function(id){
		id = id || 0;
		$rootScope.$broadcast("modalBehaviorOpen",'MODAL_EVENT');
		$rootScope.loadingModal = true;
		$http.get("/event/get/"+id).success(function(data){
			$rootScope.$broadcast("modalLoadData",data);
			$rootScope.loadingModal = false;
		}).error(function(data){
			console.error(data);
		});
	}

	$scope.loadEventsOnDate = function(year, month, day){
		$rootScope.loadingEvents++;
		$timeout(function(){
			$http.get("/event/date/"+year+"/"+$dateStringify.zerofill(month)+"/"+$dateStringify.zerofill(day)).success(function(data){
				$scope.eventlist = data;
				$timeout(function(){$rootScope.loadingEvents--;},10);
			}).error(function(data){
				console.error(data);
				$timeout(function(){$rootScope.loadingEvents--;},10);
			});
		},300);
	};

	$scope.requestEventsByDay = function(){
		$rootScope.loadingEvents++;
		$timeout(function(){
			$http.get("/event/list/"+$scope.now.todayYear+"/"+$scope.now.todayMonth).success(function(data){
				$scope.markDaysWithEvents(data);
				$timeout(function(){$rootScope.loadingEvents--;},10);
			}).error(function(data){
				console.error(data);
				$timeout(function(){$rootScope.loadingEvents--;},10);
			});
		},300);
	};

	$scope.markDaysWithEvents = function(data){
		var date         = null;
		var day          = null;
		var month        = null;
		var year         = null;
		var calendarDate = null;
		for(var i in data){
			if(typeof i !== 'string')
				continue;

			date         = i.split("/");
			day          = parseInt(date[0]);
			month        = parseInt(date[1]) - 1;
			year         = parseInt(date[2]);
			calendarDate = null;

			for(var w in $scope.now.calendar)
				for(var d in $scope.now.calendar[w]){
					calendarDate = $scope.now.calendar[w][d]["date"];
					if(typeof calendarDate !== 'object')
						continue;
					if(calendarDate[0] == year && calendarDate[1] == month && calendarDate[2] == day)
						$scope.now.calendar[w][d].hasEvent = true;
				}
		}
	}

	$rootScope.$on('eventUpdate',function(event,data){
		for(var i in $scope.eventlist)
			if($scope.eventlist[i].id == data.id){
				$scope.eventlist[i] = data;
				return;
			}

		$scope.eventlist.push(data);
	});

	$rootScope.$on('eventDelete',function(event,data){
		for(var i in $scope.eventlist)
			if($scope.eventlist[i].id == data){
				$scope.eventlist.splice(i,1);
				return;
			}
	});

	$rootScope.$on('markDaysWithEvents',function(event,data){77
		$scope.markDaysWithEvents(data);
	});

}]);



app.controller('ConfigCtrl',['$scope','$http', '$rootScope', function($scope, $http, $rootScope){
	$scope.data = {
		groupEmail : '',
		newGroup: '',
		groupId : 0,
		groups : [
			{'id':0, 'name':'A carregar...', 'participants': []}
		],
		emails : []
	};

	$rootScope.groups = [];

	$http.get('/group/list').success(function(data){
		$scope.data.groups = data;
		$rootScope.groups = $scope.data.groups;
	}).error(function(data){
		$scope.data.groups = [{'id':0, 'name':'Erro!', 'participants': []}];
		console.log(data);
	});

	$scope.addEmail = function(){
		if($scope.data.groupEmail === '')
			return;

		var data = {
			'participant.email' : $scope.data.groupEmail
		};

		$scope.data.emails.push({'id':0, 'email':'A carregar...'})

		$http.post('/group/' + ($scope.data.groupId || '0') + '/add',data,{
			headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
		}).success(function(data){
			$scope.data.emails.pop();
			$scope.data.emails.push(data);
			$scope.data.groupEmail = "";
		}).error(function(data){
			$scope.data.emails.pop();
			console.log(data);
		});
	};

	$scope.addGroup = function(){
		if($scope.data.newGroup === '')
			return;

		var data = {
			'group.name' : $scope.data.newGroup
		};

		$scope.data.groups.push({'id':0, 'name':'A carregar...', 'participants': []})

		$http.post('/group/save',data,{
			headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
		}).success(function(data){
			$scope.data.groups.pop();
			$scope.data.groups.push(data);
			$scope.data.emails = data.participants;
			$scope.data.newGroup = "";
			$scope.data.groupId = data.id;

			$rootScope.groups = $scope.data.groups;
		}).error(function(data){
			$scope.data.groups.pop();
			console.log(data);
		});
	};

	$scope.selectGroup = function(id){
		var emails = [];
		$scope.data.groupId = id;
		for(var i in $scope.data.groups)
			if($scope.data.groups[i].id === id){
				emails = $scope.data.groups[i].participants;
				break;
			}
		$scope.data.emails = emails;
	};

	$scope.removeEmail = function(index,id){
		var originalEmail = $scope.data.emails[index].email;
		$scope.data.emails[index].email = "A remover...";

		$http.delete('/group/' + ($scope.data.groupId || '0') + '/remove/' + (id || '0')).success(function(data){
			$scope.data.emails.splice(index,1);
		}).error(function(data){
			$scope.data.emails[index].email = originalEmail;
			console.log(data);
			$scope.close();
		});
	};

	$scope.removeGroup = function(index){
		$scope.data.groups.splice(index,1);
	};

	$scope.keypressedEmail = function(event){
		if(event.which === 13)
			$scope.addEmail();
	};

	$scope.keypressedGroup = function(event){
		if(event.which === 13)
			$scope.addGroup();
	};
}]);




app.controller('EventFormCtrl', ['$scope', 'DateStringify', '$rootScope', '$http', function($scope, $dateStringify, $rootScope, $http){
	$scope.modal = {
		'id'               : 0,
		'title'            : '',
		'description'      : '',
		'local'            : '',
		'eventdate'        : '',
		'eventtime'        : '00:00',
		'remind'           : 2,
		'group'            : 0,
		'otherParticipant' : "",
		'participants'     : [],
		'others'           : []
	};

	$scope.getParticipants = function(){
		return $scope.modal.participants.concat($scope.modal.others);
	};

	$scope.addOtherParticipant = function(){
		if($scope.modal.otherParticipant == '')
			return;

		var emails = $scope.getParticipants();
		for(var i in emails)
			if(emails[i] == $scope.modal.otherParticipant){
				$scope.modal.otherParticipant = "";
				return;
			}

		$scope.modal.others.push($scope.modal.otherParticipant);
		$scope.modal.otherParticipant = "";
	};

	$scope.addOtherParticipantByKeydown = function(event){
		if(event.which === 13)
			$scope.addOtherParticipant();
	};

	$scope.removeParticipant = function(email){
		for(var i in $scope.modal.others)
			if($scope.modal.others[i] == email){
				$scope.modal.others.splice(i,1);
				return;
			}

		for(var i in $scope.modal.participants)
			if($scope.modal.participants[i] == email){
				$scope.modal.participants.splice(i,1);
				return;
			}
	}

	$rootScope.loadingModal = false;

	$scope.open = function(){
		var day   = $dateStringify.zerofill($rootScope.selectedDate.getDate());
		var month = $dateStringify.zerofill($rootScope.selectedDate.getMonth() + 1);
		var year  = $dateStringify.zerofill($rootScope.selectedDate.getFullYear());

		$scope.modal.eventdate = day+"/"+month+"/"+year;
	};

	$scope.save = function(){
		var day   = $dateStringify.zerofill($rootScope.selectedDate.getDate());
		var month = $dateStringify.zerofill($rootScope.selectedDate.getMonth() + 1);
		var year  = $dateStringify.zerofill($rootScope.selectedDate.getFullYear());

		var post = {
			'ev.title'       : $scope.modal.title       || '',
			'ev.description' : $scope.modal.description || '',
			'ev.local'       : $scope.modal.local       || '',
			'ev.eventDate'   : $scope.modal.eventdate   || (day+'/'+month+'/'+year),
			'ev.eventTime'   : $scope.modal.eventtime   || '',
			'ev.remind'      : $scope.modal.remind      || 2,
		};

		if(parseInt($scope.modal.id) > 0)
			post["ev.id"] = $scope.modal.id;

		var emails = $scope.getParticipants();
		var index = 0;
		for(var i in emails)
			post["participants["+(index++)+"].email"] = emails[i];

		$http.post('/event/save',post,{
			headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
		}).success(function(data){
			var eventdate = {}
			eventdate[data.eventdate] = 1;

			$rootScope.$broadcast('eventUpdate',data);
			$rootScope.$broadcast('markDaysWithEvents',eventdate);
			$scope.close();
		}).error(function(data){
			console.log(data);
		});
	};

	$scope.cancel = function(){
		$http.delete('/event/delete/'+($scope.modal.id || "0")).success(function(data){
			$rootScope.$broadcast("eventDelete",$scope.modal.id);
			$scope.close();
		}).error(function(data){
			console.log(data);
			$scope.close();
		});
	};


	$scope.$watch(function(){
		return $scope.modal.group;
	},function(group){
		$scope.modal.participants = [];
		for(var i in $rootScope.groups)
			if($rootScope.groups[i].id == group)
				for(var j in $rootScope.groups[i].participants)
					$scope.modal.participants.push($rootScope.groups[i].participants[j].email);
	});


	$rootScope.$on('modalLoadData',function(event,data){
		$scope.modal.id           = data.id           || '';
		$scope.modal.title        = data.title        || '';
		$scope.modal.description  = data.description  || '';
		$scope.modal.local        = data.local        || '';
		$scope.modal.eventdate    = data.eventdate    || '';
		$scope.modal.eventtime    = data.eventtime    || '';
		$scope.modal.remind       = data.remind       || '';
		$scope.modal.group        = data.group        || '';
		$scope.modal.others       = data.participants || '';
	});
}])














app.directive('modalBehavior',['$rootScope','$compile','$http',function($rootScope, $compile, $http){
	return {
		'restrict' : 'A',
		'replace' : false,
		'transclude' : false,
		'scope' : true,
		'terminal' : true,
		'priority': 1000,
		'controller': ['$scope','$rootScope',function($scope, $rootScope){
			$scope.modal = {
				'id' : null,
				'open' : false
			};

			$scope.tab = {
				tabs : [
					'Grupos'
				],
				active : 0,
				setActiveTab : function(index){
					this.active = index;
				}
			};

			$scope.close = function(){
				$scope.modal.open = false;
			}

			$rootScope.$on('modalBehaviorOpen',function(event,data){
				if(data !== $scope.modal.id)
					return;
				$scope.modal.open = true;

				if(typeof $scope.open == 'function')
					$scope.open();
			});
		}],
		'compile' : function(elem, attr){
			var $close = $(elem).find(".modal-component-title-close");
			var $modal = $(elem).find(".modal-component")
			var $bkg   = $('<div>');

			$bkg.html('&nbsp;');
			$bkg.addClass("modal-component-bkg");
			$bkg.attr('ng-class',"{'active':modal.open}");
			$bkg.attr('ng-click','close()');

			$close.attr('ng-click','close()');

			$modal.attr('ng-class',"{'active':modal.open}");

			elem.prepend($bkg);
			elem.removeAttr('modal-behavior');

			return {
				'post' : function(scope, element, att, ctrl){
					scope.modal.id = att.name;
					$compile(element)(scope);
				}
			};

		}
	}
}]);












app.directive('eventDatepicker',[function(){
	return {
		'restrict' : 'A',
		'replace' : false,
		'transclude' : false,
		'scope' : {
			'value' : '=ngModel'
		},
		'link' : function(scope, elem, attr, ctrl){
			$(elem).datepicker({
				"closeText": "Fechar",
				"currentText": "Hoje",
				"dateFormat": "dd/mm/yy",
				"dayNames": ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],
				"dayNamesMin": ["Do","Se","Te","Qu","Qu","Se","Sa"],
				"dayNamesShort": ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"],
				"monthNames": ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
				"monthNamesShort": ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
			}).change(function(){
				var self = this;
				scope.$apply(function(){
					scope.value = $(self).val();
				});
			});
		}
	}
}]);


app.directive('eventTimer',[function(){
	return {
		'restrict' : 'A',
		'replace' : false,
		'transclude' : false,
		'scope' : {
			'value' : '=ngModel'
		},
		'link' : function(scope, elem, attr, ctrl){
			$(elem).keyup(function(){
				var self = this;
				scope.$apply(function(){
					var value    = $(self).val();
					var unmasked = ("0000" + value.replace(/[^0-9]/gim,"")).substr(-4);

					scope.value = unmasked.substr(0,2) + ':' + unmasked.substr(2,2);
				});
			}).blur(function(){
				var self = this;
				scope.$apply(function(){
					var value = $(self).val();
					var parts  = value.split(":");

					if(parseInt(parts[0]) > 23 || parseInt(parts[0]) < 0 || parseInt(parts[1]) > 59 || parseInt(parts[1]) < 0)
						scope.value = '00:00';
				});
			});
		}
	}
}]);


app.directive('eventAnimable',[function(){
	return {
		'restrict' : 'A',
		'replace' : false,
		'transclude' : false,
		'scope' : true,
		'link' : function(scope, elem, attr, ctrl){
			scope.view.animateTiming = parseFloat($(elem).css('transition-duration')) * 1000;
		}
	}
}]);









/**********************************************************************************************

										DEPRECATED!!!!!!!

*************************************************************************************************/
app.directive('eventModal',['$rootScope','$compile','$http',function($rootScope, $compile, $http){
	return {
		'restrict' : 'E',
		'replace' : false,
		'transclude' : false,
		'scope' : true,
		'controller' : ['$scope','DateStringify',function($scope,$dateStringify){
			$scope.view = {
				'open' : false
			};

			$scope.participants = {
				'nextid' : 1,
				'fields' : [0],
				'values' : ['']
			}

			$scope.modal = {
				'id'          : 0,
				'title'       : '',
				'description' : '',
				'local'       : '',
				'eventdate'   : '',
				'eventtime'   : '00:00',
				'remind'      : 2
			};

			$scope.close = function(){
				$scope.view.open = false;
			};

			$scope.open = function(){
				var day   = $dateStringify.zerofill($rootScope.selectedDate.getDate());
				var month = $dateStringify.zerofill($rootScope.selectedDate.getMonth() + 1);
				var year  = $dateStringify.zerofill($rootScope.selectedDate.getFullYear());

				$scope.view.open = true;
				$scope.modal.eventdate = day+"/"+month+"/"+year;
			};

			$scope.save = function(){
				var day   = $dateStringify.zerofill($rootScope.selectedDate.getDate());
				var month = $dateStringify.zerofill($rootScope.selectedDate.getMonth() + 1);
				var year  = $dateStringify.zerofill($rootScope.selectedDate.getFullYear());

				var post = {
					'ev.title'       : $scope.modal.title       || '',
					'ev.description' : $scope.modal.description || '',
					'ev.local'       : $scope.modal.local       || '',
					'ev.eventDate'   : $scope.modal.eventdate   || (day+'/'+month+'/'+year),
					'ev.eventTime'   : $scope.modal.eventtime   || '',
					'ev.remind'      : $scope.modal.remind      || 2,
				};

				var index = 0;
				for(var i in $scope.participants.values)
					if($scope.participants.values[i].length > 0)
						post["participants["+(index++)+"].email"] = $scope.participants.values[i];

				if(parseInt($scope.modal.id) > 0)
					post["ev.id"] = $scope.modal.id;

				$http.post('/event/save',post,{
					headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
				}).success(function(data){
					var eventdate = {}
					eventdate[data.eventdate] = 1;

					$rootScope.$broadcast('eventUpdate',data);
					$rootScope.$broadcast('markDaysWithEvents',eventdate);
					$scope.close();
				}).error(function(data){
					console.log(data);
				});
			};

			$scope.cancel = function(){
				$http.delete('/event/delete/'+($scope.modal.id || "0")).success(function(data){
					$rootScope.$broadcast("eventDelete",$scope.modal.id);
					$scope.close();
				}).error(function(data){
					console.log(data);
					$scope.close();
				});
			};

			$scope.participants.add = function(){
				$scope.participants.fields.push($scope.participants.nextid++);
				$scope.participants.values.push('');
			};

			$scope.participants.remove = function(){
				if($scope.participants.fields.length > 1){
					$scope.participants.fields.pop();
					$scope.participants.values.pop();
				}
			};



			$rootScope.$on('modalLoadData',function(event,data){
				$scope.modal.id          = data.id          || '';
				$scope.modal.title       = data.title       || '';
				$scope.modal.description = data.description || '';
				$scope.modal.local       = data.local       || '';
				$scope.modal.eventdate   = data.eventdate   || '';
				$scope.modal.eventtime   = data.eventtime   || '';
				$scope.modal.remind      = data.remind      || '';

				$scope.participants.nextid = data.participants.length+1;
				$scope.participants.fields = [];
				$scope.participants.values = [];

				if(data.participants.length > 0) { 
					for(var i in data.participants) {
						$scope.participants.fields.push($scope.participants.nextid++);
						$scope.participants.values.push(data.participants[i]);
					}
				} else {
					$scope.participants.fields.push($scope.participants.nextid++);
					$scope.participants.values.push("");
				}
			});

			$rootScope.$on('openModal',function(){
				$scope.open();
			});
		}],
		'link' : function(scope, elem, attr, ctrl){
			var bkg          = $('<div />');
			var modal        = $('<div />');
			var close        = $('<div />');
			var bar          = $('<div />');
			var participants = $('<div />');

			bkg.addClass('event-modal-bkg')
			   .html('&nbsp;')
			   .attr('ng-class',"{'active':view.open}");

			bkg.click(function(){
				scope.$apply(function(){
					scope.view.open = false;
				});
			});

			close.addClass('event-modal-titlebar-close')
			     .addClass('ion-close');

			close.click(function(){
				bkg.click();
			});

			bar.addClass('event-modal-titlebar')
			   .addClass('event-modal-titlebar-title')
			   .append($('<span/>').html(attr.title || ''))
			   .append(close);

			modal.addClass('event-modal-modal')
			     .html($(elem).html())
			     .attr('ng-class',"{'active':view.open}")
			     .prepend(bar);

			
			modal.find('[event-datepicker]').datepicker({
				"closeText": "Fechar",
				"currentText": "Hoje",
				"dateFormat": "dd/mm/yy",
				"dayNames": ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],
				"dayNamesMin": ["Do","Se","Te","Qu","Qu","Se","Sa"],
				"dayNamesShort": ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"],
				"monthNames": ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
				"monthNamesShort": ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
			}).change(function(){
				var self = this;
				scope.$apply(function(){
					scope.modal.eventdate = $(self).val();
				});
			});

			modal.find('[event-timer]').keyup(function(){
				var self = this;
				scope.$apply(function(){
					var value    = $(self).val();
					var unmasked = ("0000" + value.replace(/[^0-9]/gim,"")).substr(-4);

					$(self).val(unmasked.substr(0,2) + ':' + unmasked.substr(2,2));
					scope.modal.eventtime = unmasked.substr(0,2) + ':' + unmasked.substr(2,2);
				});
			}).blur(function(){
				var self = this;
				scope.$apply(function(){
					var value = $(self).val();
					var parts  = value.split(":");

					if(parseInt(parts[0]) > 23 || parseInt(parts[0]) < 0 || parseInt(parts[1]) > 59 || parseInt(parts[1]) < 0){
						$(self).val('00:00');
						scope.modal.eventtime = '00:00';
					}
				});
			});



			var inputParticipants = modal.find('[event-replicate]');
			var htmlParticipants  = modal.find('[event-replicate]').find('input').attr("ng-repeat",inputParticipants.attr('event-replicate'));



			var dom      = $('<div />').addClass('event-modal').append(bkg).append(modal);
			var linker   = $compile(dom);
			var compiled = linker(scope);

			$(elem).replaceWith(compiled);
		}
	}
}]);