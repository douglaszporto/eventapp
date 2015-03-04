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
				'day'        : $scope.now.firstDay - i
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
				'day'        : currentDay++
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
				'day'        : currentDay++
			});
		}

		if(week.length > 0)
			$scope.now.calendar.push(week);
	};

	$scope.initialize = function(){
		var now = new Date();
		$rootScope.loadingEvents = false;

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
		$rootScope.$broadcast("openModal");
		$rootScope.$broadcast("modalLoadData",{
			"eventdate":day+"/"+month+"/"+year,
			"eventtime":"00:00",
			"remind": 2
		});
	};

	$scope.editEvent = function(id){
		id = id || 0;
		$rootScope.$broadcast("openModal");
		$rootScope.loadingModal = true;
		$http.get("/event/get/"+id).success(function(data){
			$rootScope.$broadcast("modalLoadData",data);
			$rootScope.loadingModal = false;
		}).error(function(data){
			console.error(data);
		});
	}

	$scope.loadEventsOnDate = function(year, month, day){
		$rootScope.loadingEvents = true;
		$timeout(function(){
			$http.get("/event/date/"+year+"/"+$dateStringify.zerofill(month)+"/"+$dateStringify.zerofill(day)).success(function(data){
				$scope.eventlist = data;
				$timeout(function(){$rootScope.loadingEvents = false;},10);
			}).error(function(data){
				console.error(data);
				$timeout(function(){$rootScope.loadingEvents = false;},10);
			});
		},300);
	};

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

app.directive('eventModal',['$rootScope','$compile','$http',function($rootScope, $compile, $http){
	return {
		'restrict' : 'E',
		'replace' : false,
		'transclude' : false,
		'scope' : {},
		'controller' : ['$scope','DateStringify',function($scope,$dateStringify){
			$scope.view = {
				'open' : false
			};

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
					'ev.eventdate'   : $scope.modal.eventdate   || (day+'/'+month+'/'+year),
					'ev.eventtime'   : $scope.modal.eventtime   || '',
					'ev.remind'      : $scope.modal.remind      || 2 
				};

				if(parseInt($scope.modal.id) > 0)
					post["ev.id"] = $scope.modal.id;

				$http.post('/event/save',post,{
					headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
				}).success(function(data){
					$rootScope.$broadcast('eventUpdate',data);
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



			$rootScope.$on('modalLoadData',function(event,data){
				$scope.modal.id          = data.id          || '';
				$scope.modal.title       = data.title       || '';
				$scope.modal.description = data.description || '';
				$scope.modal.local       = data.local       || '';
				$scope.modal.eventdate   = data.eventdate   || '';
				$scope.modal.eventtime   = data.eventtime   || '';
				$scope.modal.remind      = data.remind      || '';
			});

			$rootScope.$on('openModal',function(){
				$scope.open();
			});
		}],
		'link' : function(scope, elem, attr, ctrl){
			var bkg   = $('<div />');
			var modal = $('<div />');
			var close = $('<div />');
			var bar   = $('<div />');

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

			var dom      = $('<div />').addClass('event-modal').append(bkg).append(modal);
			var linker   = $compile(dom);
			var compiled = linker(scope);

			$(elem).replaceWith(compiled);

			console.log('Compiling MODAL - FINISHED');
		}
	}
}]);