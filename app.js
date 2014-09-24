function mouseXY() {
	var X = event.clientX;
	var Y = event.clientY;

	var iMaxWidth = window.innerWidth;
	var iMaxHeight = window.innerHeight;

	var width = document.getElementById("tooltip").clientWidth;
	var height = document.getElementById("tooltip").clientHeight;

	var iOffset = 30;
	var xPos = Math.max(0, Math.min(X + iOffset, iMaxWidth - width - iOffset));
	var yPos = Math.max(0, Math.min(Y - height - iOffset, iMaxHeight - height - iOffset));

	document.getElementById("tooltip").style.top = yPos;
	document.getElementById("tooltip").style.left = xPos;
}
window.onload=mouseXY;

function toFixed(x) {
	var e = parseInt(x.toString().split('+')[1]);
	if (e > 20) {
	    e -= 20;
	    x /= Math.pow(10,e);
	    x += (new Array(e+1)).join('0');
	}
	return x;
}

var b64 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";

function toB64(value) {
    var out = "";
    for (var i = value.length; i > 0; i -= 6) {
        var j = Math.max(0, i - 6);
        var chunk = value.slice(j, i);
        var char = 0;
        for (var x = chunk.length - 1, y = 1; x >= 0; x -= 1, y *= 2) {
            if (chunk.charAt(x) == '1') {
                char += y;
            }
        }
        out = b64.charAt(char) + out;
    }
    return out;
}
function fromB64(value) {
    var out = '';
    for (var i = 0; i < value.length; i += 1) {
        var char = b64.indexOf(value.charAt(i));
        var chunk = "";
        while (chunk.length < 6) {
            chunk = (char % 2) + chunk;
            char = Math.floor(char / 2);
        }
        out += chunk;
    }
    return out;
}

var skillsApp = angular.module('skillsApp', []);

skillsApp.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});
 
skillsApp.controller('SkillCtrl', function($scope, $location) {
	$scope.all_classes = classes;
	$scope.setClass = function(cls) {
		$scope.current_class = cls;
		$scope.stats = $scope.current_class.stats;
		// $scope.buffs = {
		// 	armor: 0,
		// 	recovery: 0,
		// 	agility: 0
		// };
		generate_link();
	};
	$scope.getAlternateClass = function() {
		for(var i=0; i<$scope.all_classes.length; ++i) {
			if ( $scope.all_classes[i].name==$scope.current_class.name && $scope.all_classes[i].subclass!=$scope.current_class.subclass) {
				return $scope.all_classes[i];
			}
		}
	};
	$scope.tooltip = {
		name: '',
		description: '',
		binding: ''
	};
	$scope.locked = false;

	generate_link = function(){
		var output = '';

		// For each row, each skill, add either 0 or 1
		for (var i in $scope.current_class.skills) {
			if (i=='$hashKey') continue;
			i = parseInt(i);
			var skill_row = $scope.current_class.skills[i];
			for (var ii in skill_row) {
				if (ii=='$$hashKey') continue;
				ii = parseInt(ii);
				output += (skill_row[ii].active ? "1" : "0");
			}
		}

		// Padding the string to 32 characters.
		output += '000';

		output = toB64(output);

		// Represent class with the LSB.
		output += $scope.current_class.index;
		$location.hash(output);
	};

	lockSkills = function(bLocked) {
		$scope.locked = bLocked;
		var fClass = bLocked ? "add" : "remove";
		document.getElementById("clear-all").classList[fClass]('locked');
	};

	decode_link = function(){
		var input = $location.hash();
		var c_index = parseInt(input.charAt(input.length-1));
		var input = fromB64(input.substr(0, input.length-1)).split('');
		$scope.current_class = classes[c_index];
		$scope.stats = $scope.current_class.stats;

		for (var i=0;i<$scope.current_class.skills.length;i++) {
			if (i=='$hashKey') continue;
			i = parseInt(i);
			for (var ii=0;ii<$scope.current_class.skills[i].length;ii++) {
				if (ii=='$hashKey') continue;
				ii = parseInt(ii);
				if (input.shift() === '1') {
					console.log("Active: ", i, ii);
					$scope.current_class.skills[i][ii].active = true;
				}
				if (ii === 8 && $scope.current_class.skills[i][ii].active) {
					lockSkills(true);
				}
			}
		}
	}
	
	if ($location.hash())
		decode_link();
	else {
		$scope.setClass(classes[0]);
	}

	$scope.showSkill = function(i1, i2) {
		$scope.tooltip = $scope.current_class.skills[i1][i2];
		// if (!skill.active && skill.buffs) {
		// 	$scope.buffs = skill.buffs;
		// }
	};
	$scope.clearTooltip = function() {
		$scope.tooltip = {name:'',description:''};//,binding:''};
		// $scope.buffs = {
		// 	armor: 0,
		// 	recovery: 0,
		// 	agility: 0
		// };
	};

	// deactivateBuffs = function(skill) {
	// 	if (skill.active && skill.buffs) {
	// 		$scope.stats.armor -= skill.buffs.armor;
	// 		$scope.stats.recovery -= skill.buffs.recovery;
	// 		$scope.stats.agility -= skill.buffs.agility;
	// 	}
	// }

	$scope.toggleSkill = function(row, col) {
		console.log("Here: ", row, col);

		var skill = $scope.current_class.skills[row][col];
		if (col==8) {
			skill.active = !skill.active;
			
			lockSkills(skill.active);
	
			generate_link();
			return true;
		}
//		else if ($scope.current_class.skills[1][8].active) return true;
		
		// If we've clicked on a 4-row column
		var bFourRows = row > 2 ? ( col==0||col==1||col==2 ) : ( col==1||col==2||col==3 );

		var iTarget = bFourRows ? 4 : 3;
		for (var i = 0 ;i < iTarget; i++) {
			if ( i == row ) {
				continue;
			}
			var tcol = col;

			// We have clicked on a skill in a four row column.
			if ( bFourRows ) {
				// We don't deactivate the jump, super, or melee skills.
				if ( i == 0 ) {
					continue;
				}
				// We don't deactivate the jump, super, or melee enhancement skills when clicking on the skill.
				if ( row == 0 ) {
					continue;
				}
				// We offset the column when clicking on the final skill in the column.
				if ( row == 3 ) {
					tcol++;
				}
				else if ( i == 3 ) {
					tcol--;
				}
			}

			if ( $scope.current_class.skills[i][tcol] ) {
				// deactivateBuffs($scope.current_class.skills[i][tcol]);

				$scope.current_class.skills[i][tcol].active = false;
			}
		}

		// if (!skill.active && skill.buffs) {
		// 	$scope.stats.armor += skill.buffs.armor;
		// 	$scope.stats.recovery += skill.buffs.recovery;
		// 	$scope.stats.agility += skill.buffs.agility;
		// 	$scope.buffs = {armor: 0, recovery: 0, agility: 0};
		// }

		$scope.current_class.skills[row][col].active = true;

		generate_link();
	};
	$scope.clearAllSkills = function() {
		if ( $scope.locked ) { return; }
		for(var i=0; i<$scope.current_class.skills.length; ++i) {
			for(var j=0; j<$scope.current_class.skills[i].length; ++j) {
				$scope.current_class.skills[i][j].active = false;
			}
		}
		generate_link();
	};
	$scope.getImagePath = function(i1, i2) {
		var skill = $scope.current_class.skills[i1][i2];
		return $scope.current_class.subclass.toLowerCase() + "/" + skill.name.toLowerCase().replace(/ /g,"_").replace(/'/g, "") + ".png";
	};
	$scope.calcLeft = function(width) {
		return width + 3;
	};
});
