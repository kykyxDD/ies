function CreateDataSum(){
	this.create = function(arr){
		var arr_data = [];
		var arr_azim = [];
		var arr_polar = [];
		var arr_lines = [];

		for(var i = 0; i < arr.length; i++){
			var data = main.initData.parse(arr[i]);
			var azim = {}, polar = {}

			if(data.info_ies.azim.min == 270 && data.info_ies.azim.max == 90){
				
				var a_0 = data.info_ies.azim.arr.indexOf(0);
				var path_0 = data.info_ies.azim.arr.slice(a_0)
				var path_1 = data.info_ies.azim.arr.slice(1, a_0).map(function(num){
					return (num+180)%360
				});
				path_1.push(180);

				data.info_ies.azim.min_angle = 0;
				data.info_ies.azim.max_angle = 180;
				data.info_ies.azim.min = 0;
				data.info_ies.azim.arr = path_0.concat(path_1);
				data.info_ies.azim.max = 180;
				data.info_ies.azim.sum = 180;

				var lines = data.lines;
				// console.log(lines)

				var path_l_0 = lines.slice(a_0, data.info_ies.azim.arr.length);
				var path_l_1 = lines.slice(1, a_0+1);
				data.lines = path_l_0.concat(path_l_1)

			}

			if(data.info_ies.azim.min == 90 && data.info_ies.azim.max == 270){
				var min = data.info_ies.azim.min;

				var new_azim =  data.info_ies.azim.arr.map(function(num){
					return (num - min)*2
				});

				data.info_ies.azim.min_angle = 0;
				data.info_ies.azim.max_angle = 360;
				data.info_ies.azim.min = 0;
				data.info_ies.azim.arr = new_azim;//path_0.concat(path_1);
				data.info_ies.azim.max = 360;
				data.info_ies.azim.sum = 360;
			}
			for(var k in data.info_ies.azim){
				azim[k] = data.info_ies.azim[k];
			}
			for(var k in data.info_ies.polar){
				polar[k] = data.info_ies.polar[k];
			}
			arr_azim.push(azim)
			arr_polar.push(polar)
			arr_lines.push(data.lines.slice())
			arr_data.push(data);
		}
		console.log('arr_data',arr_data)
		var info_data = main.initData.zero()

		var max_azim = arr_azim[0].sum;

		for(var a = 1; a < arr_azim.length; a++){
			var info = arr_azim[a];
			max_azim = Math.max(info.sum,max_azim)
		}
		var max_n_azim = 0
		var sum_azim = [0],sum_polar = [0]

		if(max_azim > 0){
			for(var a = 0; a < arr_azim.length; a++){
				var info = arr_azim[a];
				var new_arr = info.arr.slice();
				console.log(new_arr)
				if(info.sum > 0){
					var p = max_azim/info.sum;
					for(var i = 1; i < p; i++){
						var path = info.arr.slice(1).map(function(num){
							var new_num = info.max*i + num
							return new_num == 360 && max_azim == 360 ? 360 : new_num%360
						});
						new_arr = new_arr.concat(path)
					}
				} else {
					new_arr.push(max_azim)
				}
				arr_azim[a].arr = new_arr
				max_n_azim = Math.max(max_n_azim, new_arr.length)
				if(max_n_azim == new_arr.length){
					sum_azim = new_arr;
				}
			}
		}

		var max_polar = arr_polar[0].sum;
		var max_n_polar = 0

		for(var a = 1; a < arr_polar.length; a++){
			var info = arr_polar[a];
			max_polar = Math.max(info.sum,max_polar)
		}

		if(max_polar > 0){
			for(var a = 0; a < arr_polar.length; a++){
				var info = arr_polar[a];
				var new_arr = info.arr.slice();
				console.log(new_arr)
				if(info.sum){
					var p = max_polar/info.sum;
					for(var i = 1; i < p; i++){
						var path = info.arr.slice(1).map(function(num){
							var new_num = info.max*i + num
							return new_num == 360 && max_polar == 360 ? 360 : new_num%360
						});
						new_arr = new_arr.concat(path)
					}
					arr_polar[a].arr = new_arr
				} else {
					new_arr.push(max_polar)
				}

				max_n_polar = Math.max(max_n_polar, new_arr.length)
				if(max_n_polar == new_arr.length){
					sum_polar = new_arr;
				}
			}
		}
		console.log('sum',sum_azim)
		console.log('sum',sum_polar)

		
		var num_light = 1;
		var type_figure = 1;
		var system_units = 1; // система единиц Параметр принимает следующие значения:
							  //1 – размеры ОП в футах;
							  //2 – размеры ОП в метрах. 
		var width_light = 1;
		var height_light = 1;
		var length_light = 1
		info_data.line[0] = [num_light, -1, 1, sum_polar.length, sum_azim.length,type_figure, system_units, width_light, length_light, height_light ];
		var power =  arr_data[0].info_ies.info_data.power
		for(var i = 1; i < arr_data.length; i++){
			power = Math.max(power, parseFloat(arr_data[i].info_ies.info_data.power))
		}
		info_data.line[1] = [1, 1, power]

		this.arr_azim = arr_azim;
		this.arr_polar = arr_polar;
		this.arr_lines = arr_lines;

		var azim = main.initData.getInfoAngle(sum_azim);
		var polar = main.initData.getInfoAngle(sum_polar);

		var update_data = this.updateData(arr_data, polar, azim);

		if(!update_data.stop){

			var data_info = this.sumFigure(arr_data, sum_polar, sum_azim)
			var obj = {
				info_data : info_data,
				lines : data_info.lines,
				lines_1: data_info.lines,
				azim: main.initData.getInfoAngle(sum_azim),
				polar: main.initData.getInfoAngle(sum_polar),
				maxR: 1
			}
			var str = main.initData.stringify(obj);

			onData(str);
		}

	};

	this.updateData = function(arr, polar, azim){
		var arr_azim = azim.arr
		var stop = false
		for(var i = 0; i < arr.length; i++){
			var data = arr[i];
			console.log(data)
			arr[i].lines = this.updateAzim(data, arr_azim);
			var lines = this.updatePolar(data, polar);
			if(lines && lines.length){
				arr[i].lines = this.updatePolar(data, polar);	
			} else {
				stop = true
			}
			// arr[i].lines = this.updatePolar(data, polar);
		}
		return {
			'arr': arr,
			'stop': stop
		}
	};
	this.updatePolar = function(data, polar){
		var lines = data.lines;
		var new_data = [];
		var arr_polar = polar.arr;
		var item_polar = data.info_ies.polar;

		var update = true;
		if(arr_polar.length == item_polar.arr.length){
			for(var i = 0; i < item_polar.arr.length; i++){
				if(!update) return

				update = item_polar.arr[i] == arr_polar[i];
			}
		} else {
			update = false
		}

		var new_data = [];
		var stop = false

		if(update) {
			new_data = lines
		} else {
			for(var p = 0; p < arr_polar.length; p++){
				var itm_ang = arr_polar[p]
				var id = item_polar.arr.indexOf(itm_ang)
				var id_0 = id;
				if(itm_ang > item_polar.max){
					var k =  item_polar.max - (itm_ang - item_polar.max)
					id_0 = item_polar.arr.indexOf(k)
				}
				if(id >= 0 || id_0 >= 0){
					if(id >= 0){
						new_data[p] = lines[id];
					} else {
						new_data[p] = lines[id_0];
					}
				} else {
					stop = true
				}
			}
		}

		return !stop ? new_data : true
	};
	this.updateAzim = function(data, azim){
		var lines = data.lines;
		var new_data = [];

		var item_azim = data.info_ies.azim;

		var update = true;
		if(azim.length == item_azim.arr.length){
			for(var i = 0; i < item_azim.arr.length; i++){
				if(!update) return

				update = item_azim.arr[i] == azim[i];
			}
		} else {
			update = false
		}
		
		console.log('update',update)

		var id = azim.indexOf(item_azim.max)

		if(id == -1 ) return false
		var new_azim = azim.slice(0, id+1)
		console.log('new_path', new_azim)
		var arr_info = []
		if(update) {
			for(var p = 0 ; p < lines.length; p++){
				new_data[p] = lines[p].slice(0,item_azim.arr.length);
			}
		} else {
			if(item_azim.arr.length > 1){
				for(var i = 0; i < new_azim.length; i++){
					var a = new_azim[i];
					var obj = {};

					obj.itm = a;

					var p = 0;
					var n = 360;
					for(var j = 0; j < item_azim.arr.length; j++){
						if(a >= item_azim.arr[j]){
							p = Math.max(p, item_azim.arr[j]);
						}
						if(a <= item_azim.arr[j]){
							n = Math.min(n, item_azim.arr[j]);
						}
					}

					obj.prev    = p;
					obj.prev_id = item_azim.arr.indexOf(p);
					obj.next = item_azim.arr.length > 1 ? n : 0;
					obj.next_id = item_azim.arr.length > 1 ? item_azim.arr.indexOf(n) : 0;

					arr_info.push(obj)
				}
			}

			// console.time('start')
			for(var p = 0 ; p < lines.length; p++){
				new_data[p] = [];
				
				var arr = []
				var line = lines[p].slice(0,item_azim.arr.length);

				for(var j = 0; j < azim.length; j++){
					if(line.length == 1) {
						arr[j] = line[0];
					} else {

						var ang = j;
						var itm_ang = azim[j]
						var id = item_azim.arr.indexOf(azim[j])
						var id_0 = id;
						if(azim[j] > item_azim.max){
							if(item_azim.max == 90){
								var k =  item_azim.max - (azim[j] - item_azim.max)
								id_0 = item_azim.arr.indexOf(k)	
							} else {
								var k =  item_azim.max - azim[j]
								id_0 = item_azim.arr.indexOf(k)	
							}
						}
						

						if(id == -1 && id_0 == -1) {
							if(azim[j] > item_azim.max){
								var k =  item_azim.max - (azim[j] - item_azim.max)
								var a_1 = new_azim.indexOf(k)
								if(a_1 == -1){
									console.log('stop')
								} else {
									ang = a_1
								}

							}

							var p_id = arr_info[ang].prev_id;
							var p_a = arr_info[ang].prev
							var n_id = arr_info[ang].next_id;
							var n_a = arr_info[ang].next
							var diff = n_a - p_a;
							var percent = (azim[ang] - arr_info[ang].prev)/diff

							percent = isFinite(percent) ? percent : 0
							var a = line[p_id],
							    b = line[n_id];

							var val = (b - a) * percent + a;
							arr[j] = val
						} else {
							if(id >= 0){
								arr[j] = line[id]
							} else {
								arr[j] = line[id_0]
							}
						}
					}
				}
				new_data[p] = arr;

			}
		}
		return new_data
		// console.timeEnd('start')

	}

	this.sumFigure = function(arr_data, polar, azim){
		var new_arr = [];
		var max_R = 0
		for(var p = 0; p < polar.length; p++){
			new_arr[p] = []
			for(var a = 0; a < azim.length; a++){
				var d_0 = arr_data[0]
				var num = d_0.lines[p][a]

				var arr_num = [num]
				for(var i = 1; i < arr_data.length; i++){
					var d_i = arr_data[i]
					
					num = Math.max(num, d_i.lines[p][a])
					max_R = Math.max(max_R, num)
					arr_num.push(d_i.lines[p][a])
				}
				// console.log('0',p,a,'[', arr_num.join(', ') , ']')
				
				new_arr[p][a] = num
			}
		}
		console.log(max_R, new_arr)

		return {
			max_R : max_R,
			lines : new_arr
		}

	}
};