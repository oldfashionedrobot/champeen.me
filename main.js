(function () {
  'use strict';
  var api_key = 'e30a6388-e902-4444-b429-d5d021b3bfbc';

  angular
    .module('LolChampOrganizerApp', ['backand'])
    .config(function (BackandProvider) {
          BackandProvider.setAppName('ofrlol');
          BackandProvider.setSignUpToken('d75528a7-8cba-4642-804c-4a948decc761');
          BackandProvider.setAnonymousToken('d18d6a3d-73c8-4a90-a4d3-0f195dccd0a3');
      })
    .filter('mobafireKey', MobafireKeyFilter)
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$http', '$filter'];
  function MainCtrl($http, $filter) {
    var vm = this;

    // public vars
    vm.champions = [];
    vm.searchFilter = '';
    vm.selectedRole = null;
    vm.selectedLane = null;

    // public functions
    vm.getChampList = getChampList;
    vm.nameFilter = nameFilter;
    vm.makePlayable = makePlayable;
    vm.isPlayable = isPlayable;
    vm.makeFavorite = makeFavorite;
    vm.isFavorite = isFavorite;
    vm.setLane = setLane;
    vm.isLane = isLane;
    vm.selectRole = selectRole;
    vm.selectLane = selectLane;
    vm.roleVisible = roleVisible;
    vm.laneVisible = laneVisible;
    vm.resetFilters = resetFilters;

    vm.getChampList();

    function resetFilters() {
      vm.selectedRole = null;
      vm.selectedLane = null;
      vm.searchFilter = '';
      vm.nameFilter();
    }

    function selectRole(role) {
      vm.selectedRole = role;
    }

    function roleVisible(champ) {
      if(_.isNull(vm.selectedRole)) return true;
      return _.includes(champ.tags, vm.selectedRole);
    }

    function selectLane(lane) {
      vm.selectedLane = lane;
    }

    function laneVisible(champ) {
      if(_.isNull(vm.selectedLane)) return true;
      return vm.isLane(champ, vm.selectedLane[0]);
    }

    function makePlayable(champ) {
      if(vm.isPlayable(champ)) {
        localStorage.removeItem('playable_' + champ.id);
        champ.playable = undefined;
      } else {
        localStorage.setItem('playable_' + champ.id, true);
        champ.playable = true;
      }
    }

    function isPlayable(champ) {
      return localStorage.getItem('playable_' + champ.id) == 'true';
    }

    function makeFavorite(champ) {
      if(vm.isFavorite(champ)) {
        localStorage.removeItem('favorite_' + champ.id);
        champ.favorite = undefined;
      } else {
        localStorage.setItem('favorite_' + champ.id, true);
        champ.favorite = true;
      }
    }

    function isFavorite(champ) {
      return localStorage.getItem('favorite_' + champ.id) == 'true';
    }

    // T, M, A, J, S
    function setLane(champ, lane) {
      var laneString, storageId = 'lane_' + champ.id;

      if(vm.isLane(champ, lane)) {
        laneString = localStorage.getItem(storageId);
        localStorage.setItem(storageId, laneString.replace(lane, ''));
      } else {
        laneString = localStorage.getItem(storageId) || '';
        localStorage.setItem(storageId, laneString + lane);
      }
    }

    function isLane(champ, lane) {
      return (localStorage.getItem('lane_' + champ.id) || '').indexOf(lane) > -1;
    }

    function getChampList() {
      $http({
        method: 'GET',
        url: 'https://na.api.pvp.net/api/lol/static-data/na/v1.2/champion?champData=tags&api_key=' + api_key
      }).then(_success, _error);

      function _success(resp) {
        vm.champions = _.map(resp.data.data, function(champ) {
          if(vm.isFavorite(champ)) champ.favorite = true;
          if(vm.isPlayable(champ)) champ.playable = true;
          return champ;
        });

        vm.allChampions = vm.champions;
      }

      function _error() {
        vm.champions = [];
      }
    }

    function nameFilter() {
      var filter = vm.searchFilter.toLowerCase(), name, key;

      vm.champions = _.filter(vm.allChampions, function(champ) {
        if(_.isEmpty(vm.searchFilter)) return true;
          name = champ.name.toLowerCase();
          key = champ.key.toLowerCase();


        var nameMatch = name.indexOf(filter) > -1,
            keyMatch = key.indexOf(filter) > -1;

        return nameMatch || keyMatch;
      });
    }
  }

  function MobafireKeyFilter() {
    return function(input) {
      return input.toLowerCase().replace(' ', '-').replace("'", '').replace('.', '');
    };
  }
})();