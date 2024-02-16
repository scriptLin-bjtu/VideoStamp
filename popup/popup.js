document.getElementById("switch")
	.addEventListener("change", function() {
		let e = document.getElementById("theme-style"),
			t = document.getElementById("optionspage"),
			o = document.getElementById("title"),
			n = document.getElementById("maincontain"),
			c = document.getElementById("toggle-label");
		this.checked ? chrome.storage.local.set({
				mode: "night"
			})
			.then(() => {
				e.href = "night.css", chrome.storage.local.get(["bkcolor", "tcolor"])
					.then(e => {
						o.style.color = e.tcolor, t.style.color = e.tcolor, n.style.backgroundColor = e.bkcolor, c.style.backgroundColor = e.tcolor;
						let l = document.createElement("style"),
							d = document.createTextNode(".toggle-label::before{background-color:" + e.bkcolor + ";}");
						l.appendChild(d), document.body.appendChild(l)
					})
			}) : chrome.storage.local.set({
				mode: "day"
			})
			.then(() => {
				e.href = "day.css", o.style.color = "lightskyblue", t.style.color = "darkgrey", n.style.backgroundColor = "aliceblue", c.style.backgroundColor = "#ccc";
				let l = document.createElement("style"),
					d = document.createTextNode(".toggle-label::before{background-color:aliceblue;}");
				l.appendChild(d), document.body.appendChild(l)
			})
	}), document.addEventListener("DOMContentLoaded", function() {
		let e, t = document.getElementById("name"),
			o = document.getElementById("record"),
			n = document.getElementById("select"),
			c = document.getElementById("delete"),
			l = document.getElementById("deliver"),
			d = document.getElementById("optionspage"),
			r = document.getElementById("title"),
			m = document.getElementById("maincontain"),
			a = document.getElementById("toggle-label");
		n.innerHTML = "", chrome.runtime.sendMessage({
				getDataFromIndexedDB: !0
			}, function(t) {
				(e = t.dataFromIndexedDB)
				.forEach(function(e) {
					let t = document.createElement("option");
					t.value = e.name, t.text = e.name, n.appendChild(t)
				})
			}), chrome.storage.local.get(["mode", "bkcolor", "tcolor"])
			.then(e => {
				if ("night" == e.mode) {
					document.getElementById("switch")
						.checked = !0, document.getElementById("theme-style")
						.href = "night.css", r.style.color = e.tcolor, d.style.color = e.tcolor, m.style.backgroundColor = e.bkcolor, a.style.backgroundColor = e.tcolor;
					let t = document.createElement("style"),
						o = document.createTextNode(".toggle-label::before{background-color:" + e.bkcolor + ";}");
					t.appendChild(o), document.body.appendChild(t)
				}
			}), chrome.storage.local.get(["lang"])
			.then(e => {
				"chinese" == e.lang ? (r.textContent = "视频时间戳", d.textContent = "更多信息&设置", l.textContent = "跳转", c.textContent = "删除", o.textContent = "记录", t.placeholder = "给你的视频时刻命名") : (r.textContent = "Video Time Stamp", d.textContent = "more information & setting", l.textContent = "Go", c.textContent = "Delete", o.textContent = "Record", t.placeholder = "type your video moment name")
			}), c.addEventListener("click", function() {
				! function() {
					let e = n.options[n.selectedIndex];
					if (e) {
						let t = e.value;
						chrome.runtime.sendMessage({
							deleteValueFromIndexedDB: t
						}, function(e) {
							e && e.success
						}), n.remove(n.selectedIndex)
					}
				}()
			}), o.addEventListener("click", function() {
				let o = t.value,
					c = "";
				chrome.tabs.query({
					active: !0,
					currentWindow: !0
				}, function(t) {
					t.length > 0 && (c = t[0].url), chrome.scripting.executeScript({
						target: {
							tabId: t[0].id
						},
						function: function(e) {
							let t = document.querySelector("video");
							return t ? t.currentTime : "N/A"
						},
						args: [c]
					}, function(t) {
						let l = t[0].result,
							d = {
								name: o,
								url: c,
								videoTime: l
							},
							r = document.createElement("option");
						r.value = d.name, r.text = d.name, n.appendChild(r), e.push(d), chrome.runtime.sendMessage({
							dataToBackground: d
						}, function(e) {
							e && e.success
						})
					})
				})
			}), l.addEventListener("click", function() {
				let t = n.options[n.selectedIndex].value,
					o = e.find(e => e.name === t);
				o && chrome.tabs.query({
					active: !0,
					currentWindow: !0
				}, function(e) {
					let t = e[0].url;
					t === o.url ? chrome.scripting.executeScript({
							target: {
								tabId: e[0].id
							},
							function: function(e, t) {
								let o = document.querySelector("video");
								o && (o.currentTime = e)
							},
							args: [o.videoTime, t]
						}) : chrome.storage.local.set({
							time: o.videoTime,
							url: o.url
						})
						.then(() => {
							chrome.tabs.create({
								url: o.url
							})
						})
				})
			}), d.addEventListener("click", function() {
				chrome.runtime.openOptionsPage ? chrome.runtime.openOptionsPage() : window.open(chrome.runtime.getURL("options.html"))
			})
	});