document.getElementById('switch')?.addEventListener('change', function (this : HTMLInputElement) {
	let themeStyle = document.getElementById('theme-style') as HTMLLinkElement;
	let optionslink = document.getElementById('optionspage') as HTMLAnchorElement;
	let title = document.getElementById('title') as HTMLHeadingElement;
	let statelabel = document.getElementById('statement') as HTMLLabelElement;
	let body = document.getElementById('maincontain') as HTMLBodyElement;
	let label = document.getElementById('toggle-label') as HTMLLabelElement;
	if (this.checked) {
		chrome.storage.local.set({ mode: "night" }).then(() => {
			themeStyle.href = 'night.css';
			chrome.storage.local.get(["bkcolor", "tcolor"]).then((result) => {
				title.style.color = result.tcolor;
				optionslink.style.color = result.tcolor;
				body.style.backgroundColor = result.bkcolor;
				label.style.backgroundColor = result.tcolor;

				const style = document.createElement('style');
				const change = document.createTextNode('.toggle-label::before{background-color:' + result.bkcolor + ';}');
				style.appendChild(change);
				document.body.appendChild(style);
			});
		});

	} else {
		chrome.storage.local.set({ mode: "day" }).then(() => {
			themeStyle.href = 'day.css';
			title.style.color = "lightskyblue";
			optionslink.style.color = "darkgrey";
			body.style.backgroundColor = "aliceblue";
			label.style.backgroundColor = "#ccc";

			const style = document.createElement('style');
			const change = document.createTextNode('.toggle-label::before{background-color:aliceblue;}');
			style.appendChild(change);
			document.body.appendChild(style);
		});
	}
});

document.addEventListener('DOMContentLoaded', function () {
	let data : any;
	let inputText = document.getElementById('name') as HTMLInputElement;
	let submitButton = document.getElementById('record') as HTMLButtonElement;
	let dataSelect = document.getElementById('select') as HTMLSelectElement;
	let deleteButton = document.getElementById('delete') as HTMLButtonElement;
	let deliverButton = document.getElementById('deliver') as HTMLButtonElement;
	let optionslink = document.getElementById('optionspage') as HTMLAnchorElement;
	let title = document.getElementById('title') as HTMLHeadingElement;
	let statelabel = document.getElementById('statement') as HTMLLabelElement;
	let body = document.getElementById('maincontain') as HTMLBodyElement;
	let label = document.getElementById('toggle-label') as HTMLLabelElement;
	let lang : string;


	dataSelect.innerHTML = '';
	chrome.runtime.sendMessage({ getDataFromIndexedDB: true }, function (response) {
		data = response.dataFromIndexedDB;

		data.forEach(function (item) {
			const option = document.createElement('option');
			option.value = item.name;
			option.text = item.name;
			dataSelect.appendChild(option);
		});
	});

	chrome.storage.local.get(["mode", "bkcolor", "tcolor"]).then((result) => {
		if (result.mode == "night") {
			const theme = document.getElementById('switch') as HTMLInputElement;
			theme.checked = true;
			const themeStyle = document.getElementById('theme-style') as HTMLLinkElement;

			themeStyle.href = 'night.css';
			title.style.color = result.tcolor;
			optionslink.style.color = result.tcolor;
			body.style.backgroundColor = result.bkcolor;
			label.style.backgroundColor = result.tcolor;

			const style = document.createElement('style');
			const change = document.createTextNode('.toggle-label::before{background-color:' + result.bkcolor + ';}');
			style.appendChild(change);
			document.body.appendChild(style);
		}
	});

	chrome.storage.local.get(["lang"]).then((result) => {
		lang = result.lang;
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

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		let currentTab = tabs[0];

		chrome.scripting.executeScript({
			target: { tabId: currentTab.id },
			func: function () {
				return document.querySelector('video') !== null;
			}
		}, function (result) {
			// 根据执行结果更新label内容
			if (result) {
				if (lang === 'chinese') {
					statelabel.textContent = '功能支持当前网页';
				} else {
					statelabel.textContent = 'the current page is supported';
				}

			} else {
				if (lang === 'chinese') {
					statelabel.textContent = '当前网页无法记录视频';
				} else {
					statelabel.textContent = 'The current webpage is unable to record videos';
				}
			}
		});
	});

	function deleteSelectedOption() {
		const selectedOption = dataSelect.options[dataSelect.selectedIndex];
		if (selectedOption) {
			const selectedValue = selectedOption.value;
			chrome.runtime.sendMessage({ deleteValueFromIndexedDB: selectedValue }, function (response) {
				if (response && response.success) {
				}
			});
			dataSelect.remove(dataSelect.selectedIndex);
		}
	}

	deleteButton.addEventListener('click', function () {
		deleteSelectedOption();
	});

	interface ScriptInjectionWithFunction {
		target : { tabId : number };
		func : () => any;
	}

	(document.getElementById('record') as HTMLInputElement).addEventListener('click', function () {
		const textValue = (document.getElementById('name') as HTMLInputElement).value;
		let currentTabUrl = '';
		let isDuplicate = data.some(item => item.name === textValue);

		if (isDuplicate) {
			// 如果名字重复，进行相应的处理（例如提示用户）
			if (lang === 'chinese') {
				statelabel.textContent = '命名重复请修改!';
			} else {
				statelabel.textContent = 'Naming duplicate, please modify!';
			}
			console.log("is Duplicate");
			return;
		}

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if (tabs.length > 0) {
				currentTabUrl = tabs[0].url;
			}

			// 使用 ScriptInjectionWithFunction 类型的参数调用 executeScript
			const scriptInjection : ScriptInjectionWithFunction = {
				target: { tabId: tabs[0].id },
				func: function () {

					const videoElement = document.querySelector('video');
					const VideoTime = videoElement instanceof HTMLVideoElement ? videoElement.currentTime : 'N/A';

					return VideoTime;

				}

			};

			chrome.scripting.executeScript(scriptInjection, function (result) {
				const time : string = result[0].result; // 明确告诉 TypeScript 返回结果的类型为 string
				const data1 = {
					name: textValue,
					url: currentTabUrl,
					videoTime: time
				};
				const option = document.createElement('option');
				option.value = data1.name;
				option.text = data1.name;
				(document.getElementById('select') as HTMLSelectElement).appendChild(option);
				data.push(data1);
				chrome.runtime.sendMessage({ dataToBackground: data1 }, function (response) {
					if (response && response.success) {
						console.log("addok");
					}
				});
			});
		});
	});


	deliverButton.addEventListener('click', function () {
		const selectedOption = dataSelect.options[dataSelect.selectedIndex];
		const selectedValue = selectedOption.value;
		const selectedData = data.find(item => item.name === selectedValue);
		if (selectedData) {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				const currentTab = tabs[0];
				const currenturl = currentTab.url;
				if (currenturl === selectedData.url) {
					chrome.scripting.executeScript({
						target: { tabId: tabs[0].id },
						func: function () {

							const arg1 = arguments[0];
							const videoElement = document.querySelector('video');
							if (videoElement) {
								(videoElement as HTMLVideoElement).currentTime = arg1;
							}

						},
						args: [selectedData.videoTime]
					});
				} else {
					chrome.storage.local.set({ time: selectedData.videoTime, url: selectedData.url }).then(() => {
						chrome.tabs.create({ url: selectedData.url });
					});
				}
			});
		}
	});

	optionslink.addEventListener('click', function () {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL('options.html'));
		}
	});
});