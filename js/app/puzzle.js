(function () {
  'use strict';


  angular.module('app.puzzle', [
    'shared.d3',
    'shared.underscore'
  ])

    .directive('puzzleBoard', ['d3', '_', function (d3, _) {

      var _data = [];


      function redraw() {
        var _this = this,
          cells = this.board.selectAll('.cell').data(_data);


        function r(d) {
          return Math.floor((_this.x(d.x + 1) - _this.x(d.x)) / 2) - 2
        }


        function mouseenter(d) {
          return d3.select(this)
            .attr('r', r(d) + 3)
            .attr('stroke', '#000')
            .attr('stroke-width', 2);
        }

        function mouseleave(d) {
          return d3.select(this)
            .attr('r', r(d))
            .attr('stroke-width', 0);
        }

        function position(selection) {
          return selection.attr('cx', function (d) {
            return _this.x(d.x);
          })
            .attr('cy', function (d) {
              return _this.y(d.y);
            })
        }

        /**
         * @this {d3.selection}
         * @param {Object} d
         */
        function dragstart(d) {
          console.log("dragstart", d);
          d._drag = true;
          d3.event.sourceEvent.stopPropagation();
          d3.select(this)
            .each(function () {
              this.parentNode.appendChild(this);
            });
        }


        function drag(d) {
          if (!d._drag) {
            return;
          }
          d._x = (d._x || 0) + d3.event.dx;
          d._y = (d._y || 0) + d3.event.dy;
          d3.select(this)
            .attr("transform", "translate(" + d._x + "," + d._y + ")");
        }


        function dragend(d) {
          d._x = 0;
          d._y = 0;
          d3.select(this)
            .transition()
            .attr("transform", "translate(0,0)")
            .each("end", function (d1) {
              d1._drag = false;
            });
        }

        var draggy = d3.behavior.drag()
          .on('dragstart', dragstart)
          .on('drag', drag)
          .on('dragend', dragend);


        cells
          .transition()
          .duration(100)
          .attr('r', r)
          .call(position);

        cells
          .enter().append('circle')
          .attr('class', 'cell')
          .attr('r', 0)
          .call(position)
          .style('fill', function (d) {
            return _this.color(d.type);
          })

          .on('mouseover', mouseenter)
          .on('mouseout', mouseleave)
          .call(draggy)

          .transition()
          .delay(200)
          .duration(300)
          .attr('r', r);

        cells
          .exit()
          .transition()
          .duration(500)
          .attr('r', 0)
          .remove();
      }


      function create(svg) {

        this.svg = d3.select(svg)
          .attr('width', this.width() + this.margin.left + this.margin.right)
          .attr('height', this.height() + this.margin.top + this.margin.bottom);

        this.vis = this.svg.append('g')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this.board = this.vis.append('g');

        this.x = d3.scale.linear()
          .domain([0, +this.cells.x - 1])
          .range([0, this.width()]);

        this.y = d3.scale.linear()
          .domain([0, +this.cells.y - 1])
          .range([this.height(), 0]);


        this.color = d3.scale.category10()
          .domain(d3.range(1, this.cells.n));

      }

      function getX(n) {
        return n % this.cells.x;
      }


      function getY(n) {
        return Math.floor(n / this.cells.y);
      }


      function getN(x, y) {
        return this.cells.y * y + x;
      }


      function generate() {
        _data = _.map(_.range(0, this.cells.x * this.cells.y, 1), function (n) {
          return {
            x: getX.call(this, n),
            y: getY.call(this, n),
            type: Math.ceil(Math.random() * this.cells.n)
          };
        }.bind(this));
        console.log("_data.length", _data.length);

        redraw.call(this);
      }


      function link($scope, $element, attr) {

        $scope.playing = false;

        /**
         * @class
         * @name puzzle
         */
        var puzzle = {
          cells: {
            x: attr.x || 10,
            y: attr.y || 10,
            n: attr.n || 5
          },
          margin: {top: 50, right: 50, bottom: 50, left: 50},
          width: function () {
            return attr.width - this.margin.left - this.margin.right;
          },
          height: function () {
            return attr.height - this.margin.top - this.margin.bottom;
          }
        };
        create.call(puzzle, $element.find('svg')[0]);

//        $scope.start = function () {
//          $scope.playing = true;
        generate.call(puzzle);
//        };

      }


      return {
        restrict: 'E',
        link: link
      };

    }]);


}());
