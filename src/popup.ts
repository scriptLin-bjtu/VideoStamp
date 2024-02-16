document.getElementById('switch')?.addEventListener('change', function (this: HTMLInputElement) {
    const themeStyle = document.getElementById('theme-style') as HTMLLinkElement;
    const optionslink = document.getElementById('optionspage') as HTMLElement;
    const title = document.getElementById('title') as HTMLElement;
    const body = document.getElementById('maincontain') as HTMLElement;
    const label = document.getElementById('toggle-label') as HTMLElement;

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
    let data: { name: string, url: string, videoTime: string }[];
    const inputText = document.getElementById('name') as HTMLInputElement;
    const submitButton = document.getElementById('record') as HTMLElement;
    const dataSelect = document.getElementById('select') as HTMLSelectElement;
    const deleteButton = document.getElementById('delete') as HTMLElement;
    const deliverButton = document.getElementById('deliver') as HTMLElement;
    const optionslink = document.getElementById('optionspage') as HTMLElement;
    const title = document.getElementById('title') as HTMLElement;
    const body = document.getElementById('maincontain') as HTMLElement;
    const label = document.getElementById('toggle-label') as HTMLElement;

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
        if (result.lang == "chinese") {
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
        target: { tabId: number };
        func: () => any;
    }
    
    (document.getElementById('record') as HTMLInputElement).addEventListener('click', function () {
        const textValue = (document.getElementById('name') as HTMLInputElement).value;
        let currentTabUrl = '';
    
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                currentTabUrl = tabs[0].url;
            }
    
            // 使用 ScriptInjectionWithFunction 类型的参数调用 executeScript
            const scriptInjection: ScriptInjectionWithFunction = {
                target: { tabId: tabs[0].id },
                func: function () {
                    
                        const videoElement = document.querySelector('video');
                        const VideoTime = videoElement instanceof HTMLVideoElement ? videoElement.currentTime : 'N/A';

                        return VideoTime;
                    
                }
                
            };
    
            chrome.scripting.executeScript(scriptInjection, function (result) {
                const time: string = result[0].result; // 明确告诉 TypeScript 返回结果的类型为 string
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
        // 这里的代码与你原来的 function 内容相同
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
