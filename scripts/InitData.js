function initData(){
	var text_more = 'This file has been modified by IESKIT.COM';
	this.arr_key_info = ['iesna', 'test', 'data', 'manufac', 'lumcat', 'luminaire', 'lampcat', 'lamp', 'other', 'more', 'tilt'];
	this.getInfo = function(info){
		return {
			data: this.stringify(info),
			edit: main.view_info_ies.obj_elem.btn_down.style.visibility != "hidden"
		}
	};
	this.stringify = function(info){

		var arr = this.arr_key_info
		var info = info ? info : main.info_ies

		var data = info.info_data;
		var arr_data = [];

		data.more = text_more;

		for(var i = 0; i < arr.length; i++){
			var key = arr[i];
			if(data[key] == undefined || (key == 'data' && data['date'])) continue
			if(key == 'iesna') {
				str = ['IESNA:LM-63-', data[key]].join('')
			} else if(key != 'tilt'){
				str = ['['+key.toUpperCase()+']', data[key]].join(' ');
			} else {
				str = [ key.toUpperCase(), data[key]].join('=');
			}
			arr_data.push(str);
		}

		for(var key in data){
			if(key == 'line' || key == 'light_flow' || key == 'power' || key == 'azim' || key == 'polar') continue
			if(arr.indexOf(key) >= 0) continue
			var str = '';
			
			if(key == 'iesna') {
				str = ['IESNA:LM-63-', data[key]].join('')
			} else if(key != 'tilt'){
				str = ['['+key.toUpperCase()+']', data[key]].join(' ');
			} else {
				str = [ key.toUpperCase(), data[key]].join('=');
			}
			arr_data.splice(-2, 0, str);
		}

		if(main.builder.root.scale.x != 1) {
			data.line[0][1] = -1;
			data.line[0][2] = 1;
		}
		var lines = info.lines, 
			polar = info.polar.arr, 
			azim  = info.azim.arr, 
			maxR = info.maxR
		data.line[0][3] = info.polar.arr.length;
		data.line[0][4] = info.azim.arr.length;
		arr_data.push(data.line[0].join(' '));
		arr_data.push(data.line[1].join(' '));

		arr_data.push(info.polar.arr.join(' '));
		arr_data.push(info.azim.arr.join(' '));


		var str_data = this.getArrayData(lines, polar,azim,maxR);
		arr_data.push(str_data);

		var data_sould = arr_data[0];
		for(var i = 1; i < arr_data.length; i++){
			data_sould += '\r\n' + arr_data[i];
		}
		return data_sould
	};

	this.getArrayData = function(lines, polar, azim , maxR){
		var len_polar = polar ? polar.length : main.info_ies.polar.arr.length;
		var len_azim = azim ? azim.length : main.info_ies.azim.arr.length;
		var arr_data = [];
		var maxR = maxR ? maxR : main.info_ies.maxR;
		var lines = lines ? lines : main.info_ies.lines;
		for(var a = 0; a < len_azim; a++){
			arr_data[a] = [];

			for(var p = 0; p < len_polar; p++){
				var num = lines[p][a]*maxR;
				var arr_num = (''+num).split('.')
				if(arr_num[1] && arr_num[1].length > 4){
					var fix = parseFloat(arr_num[1].substr(0, 4))
					if(fix){
						if((10000 - fix) > 1){
							num = num.toFixed(4);
						} else {
							num = Math.ceil(num);
						}
					} else {
						num = Math.floor(num);
					}
				}

				arr_data[a][p] = num;
			}
			arr_data[a] = arr_data[a].join(' ');
		}
		return arr_data.join('\n')
	};
	this.parse = function(text){
		var ts = /\w/
		var lines = text.replace(/,/g, '.').trim().split('\n');
		for(var l = 0; l < lines.length; l++){
			if(!ts.test(lines[l])){
				lines.splice(l,1)
				--l
			}
		}
		var index_last_s = 0;
		var info_ies = {
			azim: {
				min : 0,
				arr : [0],
				max : 0
			},
			polar : {
				min : 0,
				arr : [0],
				max : 0
			},
			info_data: false
		}
		var info_data = {};
		for(var i = 0; i < lines.length; i++){
			var line = lines[i];
			// var arr_1 = line.split(':');
			var arr_2 = line.split(']');
			var key = false;
			var val = false;
			if(arr_2.length > 1){
				var arr_3 = arr_2[0].split('[');

				val = arr_2.slice(1).join(':');
				if(arr_2.length > 1 && arr_3.length >= 1){
					if(arr_3[0] == ''){
						key = arr_3[1];
					} else {
						key = arr_3[0];
					}
				}

				index_last_s = i;
			} 
			if(line.indexOf('TILT=') >= 0){
				var arr = line.split('=');
				key = 'TILT';
				val = arr[1]

				index_last_s = i;

			}
			if(line.indexOf('IESNA:LM-63') >= 0) {
				info_data['iesna'] = line.replace('IESNA:LM-63-', '');
			}
			if(key && val){
				key = key.toLowerCase();
				if(info_data[key]){
					info_data[key] += ' ' + val ;
				} else {
					info_data[key] = val;
				}
				
			}
		}
		info_ies.info_data = info_data;
		var data = lines.slice(index_last_s+1)
		var index_zero = [];
		if(!data[0]) return [];
		var arr_info = this.delStr(data[0].split(' '))

		for(var i = 0; i < arr_info.length; i++){
			arr_info[i] = parseFloat(arr_info[i]);
		}
		var arr_info_1 = this.delStr(data[1].split(' '))
		var num_polar = parseFloat(arr_info[3]);
		var num_azim = parseFloat(arr_info[4]);
		// main.info_ies.info_data.light_flow = parseFloat(arr_info[1]);
		info_ies.info_data.polar = num_polar;
		info_ies.info_data.azim = num_azim;
		info_ies.info_data.power = parseFloat(arr_info_1[2]);
		info_ies.info_data.default_light_flow = parseFloat(arr_info[1]);
		info_ies.info_data.line = [
			arr_info, arr_info_1
		]
		var arr_angle = []

		for(var i = 2; i < data.length;i++){
			var arr = data[i].replace(/\t/g, ' ').split(' ');
			arr = this.delStr(arr);
			arr_angle = arr_angle.concat(arr);
		}
		var arr_polar_angle = arr_angle.splice(0, num_polar)
		var arr_azim_angle = arr_angle.splice(0, num_azim)
		var arr_data = [];

		for(var i = 0; i < num_azim; i++){
			arr_data.push(arr_angle.splice(0, num_polar))
		}

		info_ies.lines_1 = arr_data;
		info_ies.azim = this.getInfoAngle(arr_azim_angle)
		info_ies.polar = this.getInfoAngle(arr_polar_angle)
		return {
			info_ies: info_ies,
			lines: this.getArrData(info_ies.polar.arr, info_ies.azim.arr, arr_data)
		}
	}

	this.zero = function(){
		var info_data = {}
		var arr_key = this.arr_key_info
		
		for(var i = 0; i < arr_key.length; i++){
			info_data[arr_key[i]] = ''
			if(arr_key[i] == 'data'){
				var d = new Date()
				info_data['data'] = [d.getDate(),d.getMonth()+1,d.getFullYear()].join('.');
			}
		}
		info_data.line = [];
		return info_data
	}
	this.getArrData = function(polar, azim, coor){
		var arr_data = [];

		var first_angle = parseFloat(azim[0]);
		var last_angle = parseFloat(azim[azim.length-1]);
		var sum = last_angle + (360 - first_angle)%360;


		for(var i = 0; i < polar.length; i++){
			arr_data[i] = [];
			for(var j = 0; j < azim.length; j++){
				arr_data[i][j] = parseFloat(coor[j][i])
			}
		}

		arr_data = this.arrReverse(arr_data, sum)

		return arr_data
	},
	this.arrReverse = function(arr, sum){
		if(sum > 0 && sum < 360){
			var path = Math.floor(360/sum);
			for(var i = 0; i < arr.length; i++){
				var item_arr_str = arr[i];
				
				var new_arr = [];
				if(path%2 == 0){
					if(sum != 90){
						var rever_arr = arr[i].slice().reverse();
						var new_path = arr[i].slice().concat(rever_arr.slice(1,-1));
						var l = path/2;

						for(var p = 0; p < l; p++){
							new_arr = new_arr.concat(new_path)
						}	
					} else {
						var rever_arr = arr[i].slice().reverse();
						var new_path = arr[i].slice().concat(rever_arr.slice(1));
						new_arr = new_path.concat(new_path.slice(1,-1))
					}
					
				} else {
					for(var p = 0; p < path; p++){
						new_arr = new_arr.concat(item_arr_str)
					}
				}

				arr[i] = new_arr
			}
		}
		return arr
	}

	this.delStr = function(arr){
		for(var i = 0; i < arr.length; i++){
			var num = !isNaN(parseFloat(arr[i]))

			if(!num){
				arr.splice(i,1)
				--i
			}
		}
		return arr
	}
	this.getInfoAngle = function(arr){
		var first_angle = parseFloat(arr[0]);
		var last_angle = parseFloat(arr[arr.length-1]);
		var sum = last_angle + (360 - first_angle)%360;

		var min = 10000;
		var max = 0;

		for(var i = 0; i < arr.length; i++){
			arr[i] = parseFloat(arr[i])
			min = Math.min(min, arr[i])
			max = Math.max(max, arr[i])
		}
		var obj = {
			min_angle: min,
			max_angle: max,
			min: first_angle,
			arr: arr,
			max: last_angle,
			sum: sum
		}

		return obj
	}
}

