document.getElementById('switch').addEventListener('change', function () {
    let themeStyle = document.getElementById('theme-style');
    let optionslink = document.getElementById('optionspage');
    let title=document.getElementById('title');
	let body=document.getElementById('maincontain');
	let label=document.getElementById('toggle-label');
	
    // �л�������ʽ����
    if (this.checked) {
        chrome.storage.local.set({ mode:"night" }).then(() => {
            themeStyle.href = 'night.css'; // �л�Ϊҹ������
			chrome.storage.local.get(["bkcolor","tcolor"]).then((result) => {
				title.style.color=result.tcolor;
				optionslink.style.color=result.tcolor;
				body.style.backgroundColor=result.bkcolor;
				label.style.backgroundColor=result.tcolor;
				let style=document.createElement('style');
				    let change=document.createTextNode('.toggle-label::before{background-color:'+result.bkcolor+';}')//更改后伪元素的样式
				    style.appendChild(change);
				    document.body.appendChild(style);//把内联样式表添加到html中
				
			});
        });
        
    } else {
        chrome.storage.local.set({ mode: "day" }).then(() => {

            themeStyle.href = 'day.css'; // �л�Ϊ��������
			title.style.color="lightskyblue";
			optionslink.style.color="darkgrey";
			body.style.backgroundColor="aliceblue";
			label.style.backgroundColor="#ccc";
			let style=document.createElement('style');
			    let change=document.createTextNode('.toggle-label::before{background-color:aliceblue;}')//更改后伪元素的样式
			    style.appendChild(change);
			    document.body.appendChild(style);//把内联样式表添加到html中
        });
        
    }
});

document.addEventListener('DOMContentLoaded', function () {
    let data;
    let inputText = document.getElementById('name');
    let submitButton = document.getElementById('record');
    let dataSelect = document.getElementById('select');
    let deleteButton = document.getElementById('delete');
    let deliverButton = document.getElementById('deliver');
    let optionslink = document.getElementById('optionspage');
	let title=document.getElementById('title');
	let body=document.getElementById('maincontain');
	let label=document.getElementById('toggle-label');
	
    // �������ݲ�����������
    dataSelect.innerHTML = '';
    chrome.runtime.sendMessage({ getDataFromIndexedDB: true }, function (response) {
        data = response.dataFromIndexedDB;

        // �������ݵ� <select> Ԫ��
        data.forEach(function (item) {
            let option = document.createElement('option');
            option.value = item.name;
            option.text = item.name;
            dataSelect.appendChild(option);
        });
    });
    //ͬ������
    chrome.storage.local.get(["mode","bkcolor","tcolor"]).then((result) => {
        console.log(result.mode);
        if (result.mode == "night") {
            let theme = document.getElementById('switch');
            theme.checked = true;
            let themeStyle = document.getElementById('theme-style');
            
            themeStyle.href = 'night.css'; // �л�Ϊҹ������
            title.style.color=result.tcolor;
            optionslink.style.color=result.tcolor;
            body.style.backgroundColor=result.bkcolor;
			label.style.backgroundColor=result.tcolor;
			let style=document.createElement('style');
			    let change=document.createTextNode('.toggle-label::before{background-color:'+result.bkcolor+';}')//更改后伪元素的样式
			    style.appendChild(change);
			    document.body.appendChild(style);//把内联样式表添加到html中
			
        }
    });
	chrome.storage.local.get(["lang"]).then((result) => {
		
		console.log(result.lang);
	    if (result.lang == "chinese") {
	        title.textContent="视频时间戳";
			optionslink.textContent="更多信息&设置";
			deliverButton.textContent="跳转";
			deleteButton.textContent="删除";
			submitButton.textContent="记录";
			inputText.placeholder="给你的视频时刻命名";
			
	    }else{
			title.textContent="Video Time Stamp";
			optionslink.textContent="more information & setting";
			deliverButton.textContent="Go";
			deleteButton.textContent="Delete";
			submitButton.textContent="Record";
			inputText.placeholder="type your video moment name";
		}
	});
	

    // ɾ��ѡ���ĺ���
    function deleteSelectedOption() {
        let selectedOption = dataSelect.options[dataSelect.selectedIndex];
        if (selectedOption) {
            let selectedValue = selectedOption.value;
            
            // ������Ϣ֪ͨ background ɾ������
            chrome.runtime.sendMessage({ deleteValueFromIndexedDB: selectedValue }, function (response) {
                if (response && response.success) {
                    
                }
            });
            dataSelect.remove(dataSelect.selectedIndex);
        }
    }




    deleteButton.addEventListener('click', function () {
        // ����ɾ��ѡ���
        deleteSelectedOption();
    });

    submitButton.addEventListener('click', function () {
        let textValue = inputText.value;
        let currentTabUrl = '';


        // ��ȡ��ǰѡ�����Ϣ������ URL��
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                currentTabUrl = tabs[0].url;
            }

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: function (arg1) {
                    if (arg1.startsWith("https://www.bilibili.com/")) {
                        console.log("is bilibili");
						//let videoElement =document.querySelector('video');
						let videoElement = document.querySelector('bwp-video').shadowRoot.querySelector('video');
						if(videoElement){
							console.log(videoElement);
							let VideoTime = videoElement ? videoElement.currentTime : 'N/A';
							return VideoTime;
						}
                        
                    } else {
                        console.log("is  not bilibili");
                        let videoElement = document.querySelector('video');
                        console.log(videoElement.currentTime);
                        let VideoTime = videoElement ? videoElement.currentTime : 'N/A';
                        return VideoTime; // ������Ƶʱ��

                    }

                }, args: [currentTabUrl]

            }, function (result) {
                // Ȼ�������ݴ����ɶ���
                let time = result[0].result;
                let data1 = {
                    name: textValue,
                    url: currentTabUrl,
                    videoTime: time
                };
                // ����������
               let option = document.createElement('option');
                option.value = data1.name;
                option.text = data1.name;
                dataSelect.appendChild(option);
                data.push(data1);
                // �������ݸ� background ҳ��
                chrome.runtime.sendMessage({ dataToBackground: data1 }, function (response) {
                    if (response && response.success) {
                        console.log("addok");
                    }
                });
            });


        });

    });
    deliverButton.addEventListener('click', function () {

        let selectedOption = dataSelect.options[dataSelect.selectedIndex];
        let selectedValue = selectedOption.value;
        console.log(selectedValue);
        let selectedData = data.find(item => item.name === selectedValue);
        if (selectedData) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                let currentTab = tabs[0];
                let currenturl = currentTab.url;
                if (currenturl === selectedData.url) {

                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: function (arg1, arg2) {
                            if (arg2.startsWith("https://www.bilibili.com/")) {
                                console.log("is bilibili");
								//let videoElement=document.querySelector('video');
								let videoElement = document.querySelector('bwp-video').shadowRoot.querySelector('video');
								if(videoElement){
									videoElement.currentTime=arg1;
								}
                                

                            } else {
                                let videoElement = document.querySelector('video');
                                console.log("is  not bilibili");
                                if (videoElement) {

                                    videoElement.currentTime = arg1;

                                }

                            }

                        },
                        args: [selectedData.videoTime, currenturl]
                    });
                } else {
                    chrome.storage.local.set({ time: selectedData.videoTime, url: selectedData.url, }).then(() => {

                        chrome.tabs.create({ url: selectedData.url });

                    });

                }
            });
        }

    });
    //����ѡ����ҳ
    optionslink.addEventListener('click', function () {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }

    });
});
