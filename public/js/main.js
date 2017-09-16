var app = angular.module('playlistApp', []);
app.controller('playlistController', ($scope, $http, $sce) => {
    $scope.sub = 'Music';
    $scope.sort = 'hot';
    $scope.load = () => {
        $http
            .get('/sub/' + $scope.sub + '?sort=' + $scope.sort)
            .then(function(response) {
                $scope.urlList = new Array();
                response.data.forEach(function(element) {
                    let url = $sce.trustAsResourceUrl(
                        'https://youtube.com/embed/' + element.url
                    );
                    element.url = url;
                    $scope.urlList.push(element);
                });
            })
            .catch(function(err) {
                alert(err);
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
});
