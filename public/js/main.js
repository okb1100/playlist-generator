var app = angular.module('playlistApp', ['youtube-embed']);
app.controller('playlistController', ($scope, $http) => {
    $scope.playerVars = {
        controls: 1,
        autoplay: 1
    };
    $scope.sub = 'Music';
    $scope.sort = 'hot';
    $scope.load = () => {
        $http
            .get('/sub/' + $scope.sub + '?sort=' + $scope.sort)
            .then(function(response) {
                $scope.urlList = response.data;
            })
            .catch(function(err) {
                console.error(err);
            });
    };
    $scope.skip = to => {
        if (to === 'next' && $scope.urlIndex < $scope.urlList.length) {
            $scope.urlIndex++;
        } else if (to === 'prev' && $scope.urlIndex > 0) {
            $scope.urlIndex--;
        } else if (typeof to === 'number') {
            $scope.urlIndex = to;
        }
    };
    $scope.$on('youtube.player.ended', function($event, player) {
        $scope.urlIndex++;
    });
});
