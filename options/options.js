var _a,_b,_c,_d,_e,_f;
const settingdiv = document.getElementById("setting"),
	notediv = document.getElementById("note"),
	aboutdiv = document.getElementById("about");
document.addEventListener("DOMContentLoaded", function() {
	const e = document.getElementById("title"),
		t = document.getElementById("btn-s"),
		n = document.getElementById("btn-n"),
		o = document.getElementById("btn-a"),
		d = document.getElementById("tip1"),
		i = document.getElementById("tip2"),
		l = document.getElementById("btn-color"),
		m = document.getElementById("about-author"),
		u = document.getElementById("about-version"),
		c = document.getElementById("about-explain"),
		a = document.getElementById("edge_page"),
		s = document.getElementById("th1"),
		r = document.getElementById("th2"),
		g = document.getElementById("th3");
	chrome.storage.local.get(["lang"])
		.then(y => {
			"chinese" == y.lang ? (e.textContent = "视频时间戳", t.textContent = "设置", n.textContent = "笔记", o.textContent = "关于", d.textContent = "设置扩展主题颜色:", i.textContent = "设置扩展字体颜色:", l.textContent = "修改", m.textContent = "开发者:uranus", u.textContent = "版本:0.3", c.textContent = "视频时间戳是一个浏览器扩展程序，致力于提升您的浏览器视频观看体验，你可以在多方面使用到:视频网课笔记，电影时刻记录，长视频导航等等......该扩展永久免费使用。如果您对此满意，请给我们一个好评!", a.textContent = "---\x3e去评价", s.textContent = "名称", r.textContent = "视频地址", g.textContent = "视频时刻") : (e.textContent = "Video Time Stamp", t.textContent = "Setting", n.textContent = "Note", o.textContent = "About", d.textContent = "Set your extension theme color:", i.textContent = "Set your extension text color:", l.textContent = "Change", m.textContent = "Developer:uranus", u.textContent = "Version:0.3", c.textContent = "The Video Time Stamp is a browser extension program dedicated to optimizing your browser video viewing experience. You can use it in various ways, such as online course notes, movie moments, long video navigation, etc. This extension is permanently free to use. If you are satisfied with it, please give us a good review!", a.textContent = "---\x3ego to review", s.textContent = "name", r.textContent = "url", g.textContent = "video_time")
		})
}), null === (_a = document.getElementById("btn-color")) || void 0 === _a || _a.addEventListener("click", function() {
	const e = document.getElementById("BackgroundColorInput"),
		t = document.getElementById("TextColorInput");
	chrome.storage.local.set({
		bkcolor: e.value,
		tcolor: t.value
	})
}), null === (_b = document.getElementById("btn-s")) || void 0 === _b || _b.addEventListener("click", function() {
	settingdiv.style.display = "block", notediv.style.display = "none", aboutdiv.style.display = "none"
}), null === (_c = document.getElementById("btn-n")) || void 0 === _c || _c.addEventListener("click", function() {
	let e, t = indexedDB.open("myDatabase2", 2),
		n = document.getElementById("table")
		.getElementsByTagName("tbody")[0];
	settingdiv.style.display = "none", notediv.style.display = "block", aboutdiv.style.display = "none", n.innerHTML = "", t.onupgradeneeded = function(t) {
		e = t.target.result, (e = t.target.result)
			.createObjectStore("myStore", {
				keyPath: "id",
				autoIncrement: !0
			})
			.createIndex("nameIndex", "name", {
				unique: !1
			})
	}, t.onsuccess = function(t) {
		(e = t.target.result)
		.transaction(["myStore"], "readonly")
			.objectStore("myStore")
			.openCursor()
			.onsuccess = function(e) {
				const t = e.target.result;
				if (t) {
					let e = n.insertRow();
					e.insertCell(0)
						.appendChild(document.createTextNode(t.value.name)), e.insertCell(1)
						.appendChild(document.createTextNode(t.value.url)), e.insertCell(2)
						.appendChild(document.createTextNode(t.value.videoTime)), t.continue()
				}
			}
	}, t.onerror = function(e) {}
}), null === (_d = document.getElementById("btn-a")) || void 0 === _d || _d.addEventListener("click", function() {
	settingdiv.style.display = "none", notediv.style.display = "none", aboutdiv.style.display = "block"
}), null === (_e = document.getElementById("btn-chinese")) || void 0 === _e || _e.addEventListener("click", function() {
	const e = document.getElementById("title"),
		t = document.getElementById("btn-s"),
		n = document.getElementById("btn-n"),
		o = document.getElementById("btn-a"),
		d = document.getElementById("tip1"),
		i = document.getElementById("tip2"),
		l = document.getElementById("btn-color"),
		m = document.getElementById("about-author"),
		u = document.getElementById("about-version"),
		c = document.getElementById("about-explain"),
		a = document.getElementById("edge_page"),
		s = document.getElementById("th1"),
		r = document.getElementById("th2"),
		g = document.getElementById("th3");
	e.textContent = "视频时间戳", t.textContent = "设置", n.textContent = "笔记", o.textContent = "关于", d.textContent = "设置扩展主题颜色:", i.textContent = "设置扩展字体颜色:", l.textContent = "修改", m.textContent = "开发者:uranus", u.textContent = "版本:0.3", c.textContent = "视频时间戳是一个浏览器扩展程序，致力于提升您的浏览器视频观看体验，你可以在多方面使用到:视频网课笔记，电影时刻记录，长视频导航等等......该扩展永久免费使用。如果您对此满意，请给我们一个好评!", a.textContent = "---\x3e去评价", s.textContent = "名称", r.textContent = "视频地址", g.textContent = "视频时刻", chrome.storage.local.set({
		lang: "chinese"
	})
}), null === (_f = document.getElementById("btn-english")) || void 0 === _f || _f.addEventListener("click", function() {
	const e = document.getElementById("title"),
		t = document.getElementById("btn-s"),
		n = document.getElementById("btn-n"),
		o = document.getElementById("btn-a"),
		d = document.getElementById("tip1"),
		i = document.getElementById("tip2"),
		l = document.getElementById("btn-color"),
		m = document.getElementById("about-author"),
		u = document.getElementById("about-version"),
		c = document.getElementById("about-explain"),
		a = document.getElementById("edge_page"),
		s = document.getElementById("th1"),
		r = document.getElementById("th2"),
		g = document.getElementById("th3");
	e.textContent = "Video Time Stamp", t.textContent = "Setting", n.textContent = "Note", o.textContent = "About", d.textContent = "Set your extension theme color:", i.textContent = "Set your extension text color:", l.textContent = "Change", m.textContent = "Developer:uranus", u.textContent = "Version:0.3", c.textContent = "The Video Time Stamp is a browser extension program dedicated to optimizing your browser video viewing experience. You can use it in various ways, such as online course notes, movie moments, long video navigation, etc. This extension is permanently free to use. If you are satisfied with it, please give us a good review!", a.textContent = "---\x3ego to review", s.textContent = "name", r.textContent = "url", g.textContent = "video_time", chrome.storage.local.set({
		lang: "english"
	})
});