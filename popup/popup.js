document.getElementById('switch').addEventListener('change', function() {
	let themeStyle = document.getElementById('theme-style');
	let optionslink = document.getElementById('optionspage');
	let title = document.getElementById('title');
	let statelabel=document.getElementById('statement');
	let body = document.getElementById('maincontain');
	let label = document.getElementById('toggle-label');

	if (this.checked) {
		chrome.storage.local.set({
			mode: "night"
		}).then(() => {

			themeStyle.href = 'night.css';
			chrome.storage.local.get(["bkcolor", "tcolor"]).then((result) => {
				title.style.color = result.tcolor || "forestgreen";
				statelabel.style.color = result.tcolor || "forestgreen";
				optionslink.style.color = result.tcolor || "darkgreen";
				body.style.backgroundColor = result.bkcolor || "#28322c";
				label.style.backgroundColor = result.tcolor || "darkseagreen";
				let style = document.createElement('style');
				let change = document.createTextNode('.toggle-label::before{background-color:' +
					(result.bkcolor || "#33722a") + ';}');
				style.appendChild(change);
				document.body.appendChild(style);
			});
		});

	} else {
		chrome.storage.local.set({
			mode: "day"
		}).then(() => {

			themeStyle.href = 'day.css'; // �л�Ϊ��������
			title.style.color = "lightskyblue";
			statelabel.style.color = "lightskyblue";
			optionslink.style.color = "darkgrey";
			body.style.backgroundColor = "aliceblue";
			label.style.backgroundColor = "#ccc";
			let style = document.createElement('style');
			let change = document.createTextNode(
				'.toggle-label::before{background-color:aliceblue;}') //更改后伪元素的样式
			style.appendChild(change);
			document.body.appendChild(style); //把内联样式表添加到html中
		});

	}
});

document.addEventListener('DOMContentLoaded', function() {
	let data;
	let inputText = document.getElementById('name');
	let submitButton = document.getElementById('record');
	let dataSelect = document.getElementById('select');
	let deleteButton = document.getElementById('delete');
	let deliverButton = document.getElementById('deliver');
	let optionslink = document.getElementById('optionspage');
	let title = document.getElementById('title');
	let statelabel=document.getElementById('statement');
	let body = document.getElementById('maincontain');
	let label = document.getElementById('toggle-label');
	let lang;

	//加载用户记录的数据
	dataSelect.innerHTML = '';
	chrome.runtime.sendMessage({
		getDataFromIndexedDB: true
	}, function(response) {
		data = response.dataFromIndexedDB;

		//从数据库获取
		data.forEach(function(item) {
			let option = document.createElement('option');
			option.value = item.name;
			option.text = item.name;
			dataSelect.appendChild(option);
		});
	});
	//加载主题色
	chrome.storage.local.get(["mode", "bkcolor", "tcolor"]).then((result) => {
		console.log(result.mode);
		if (result.mode == "night") {
			let theme = document.getElementById('switch');
			theme.checked = true;
			let themeStyle = document.getElementById('theme-style');

			themeStyle.href = 'night.css'; // �л�Ϊҹ������
			title.style.color = result.tcolor;
			statelabel.style.color = result.tcolor;
			optionslink.style.color = result.tcolor;
			body.style.backgroundColor = result.bkcolor;
			label.style.backgroundColor = result.tcolor;
			let style = document.createElement('style');
			let change = document.createTextNode('.toggle-label::before{background-color:' + result
				.bkcolor + ';}') //更改后伪元素的样式
			style.appendChild(change);
			document.body.appendChild(style); //把内联样式表添加到html中

		}
	});
	chrome.storage.local.get(["lang"]).then((result) => {

		console.log(result.lang);
		lang=result.lang;
		if (lang == "chinese") {
			title.textContent = "视频时间戳";
			optionslink.textContent = "更多信息&设置";
			deliverButton.textContent = "跳转";
			deleteButton.textContent = "删除";
			submitButton.textContent = "记录";
			inputText.placeholder = "给你的视频时刻命名";

		} else {
			title.textContent = "Video Time Stamp";
			optionslink.textContent = "more information & setting";
			deliverButton.textContent = "Go";
			deleteButton.textContent = "Delete";
			submitButton.textContent = "Record";
			inputText.placeholder = "type your video moment name";
		}
	});
	//判断当前网页是否有视频标签可以记录
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	        let currentTab = tabs[0];
	
	        chrome.scripting.executeScript({
	            target: { tabId: currentTab.id },
	            function: function () {
	                return document.querySelector('video') !== null;
	            }
	        }, function (result) {
	            // 根据执行结果更新label内容
	            if (result) {
					if(lang==='chinese'){
						statelabel.textContent = '功能支持当前网页';
					}else{
						statelabel.textContent = 'the current page is supported';
					}
	                
	            } else {
	                if(lang==='chinese'){
	                	statelabel.textContent = '当前网页无法记录视频';
	                }else{
	                	statelabel.textContent = 'The current webpage is unable to record videos';
	                }
	            }
	        });
	    });

	//删除选项
	function deleteSelectedOption() {
		let selectedOption = dataSelect.options[dataSelect.selectedIndex];
		if (selectedOption) {
			let selectedValue = selectedOption.value;

			//发送请求给background做出删除操作
			chrome.runtime.sendMessage({
				deleteValueFromIndexedDB: selectedValue
			}, function(response) {
				if (response && response.success) {

				}
			});
			dataSelect.remove(dataSelect.selectedIndex);
		}
	}




	deleteButton.addEventListener('click', function() {
		deleteSelectedOption();
	});

	submitButton.addEventListener('click', function() {
		let textValue = inputText.value.trim();
		let currentTabUrl = '';

		let isDuplicate = data.some(item => item.name === textValue);

		if (isDuplicate) {
			// 如果名字重复，进行相应的处理（例如提示用户）
			if(lang==='chinese'){
				statelabel.textContent='命名重复请修改!';
			}else{
				statelabel.textContent='Naming duplicate, please modify!';
			}
			console.log("is Duplicate");
			return;
		}


		//获取视频进度与网页url
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs) {
			if (tabs.length > 0) {
				currentTabUrl = tabs[0].url;
			}

			chrome.scripting.executeScript({
				target: {
					tabId: tabs[0].id
				},
				function: function(arg1) {


					let videoElement = document.querySelector('video');
					console.log(videoElement.currentTime);
					let VideoTime = videoElement ? videoElement.currentTime : 'N/A';
					return VideoTime; //返回视频进度


				},
				args: [currentTabUrl]

			}, function(result) {
				//打包数据发送给background(然后储存在数据库)
				let time = result[0].result;
				let data1 = {
					name: textValue,
					url: currentTabUrl,
					videoTime: time
				};
				
				let option = document.createElement('option');
				option.value = data1.name;
				option.text = data1.name;
				dataSelect.appendChild(option);
				data.push(data1);
				
				chrome.runtime.sendMessage({
					dataToBackground: data1
				}, function(response) {
					if (response && response.success) {
						console.log("addok");
					}
				});
			});


		});

	});
	deliverButton.addEventListener('click', function() {

		let selectedOption = dataSelect.options[dataSelect.selectedIndex];
		let selectedValue = selectedOption.value;
		console.log(selectedValue);
		let selectedData = data.find(item => item.name === selectedValue);
		if (selectedData) {
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
				let currentTab = tabs[0];
				let currenturl = currentTab.url;
				if (currenturl === selectedData.url) {

					chrome.scripting.executeScript({
						target: {
							tabId: tabs[0].id
						},
						function: function(arg1, arg2) {

							let videoElement = document.querySelector('video');
							
							if (videoElement) {

								videoElement.currentTime = arg1;

							}



						},
						args: [selectedData.videoTime, currenturl]
					});
				} else {
					chrome.storage.local.set({
						time: selectedData.videoTime,
						url: selectedData.url,
					}).then(() => {

						chrome.tabs.create({
							url: selectedData.url
						});

					});

				}
			});
		}

	});
	//打开设置界面
	optionslink.addEventListener('click', function() {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL('options.html'));
		}

	});
});