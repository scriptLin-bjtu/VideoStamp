let db, data = [],
	request = indexedDB.open("myDatabase2", 2);
request.onupgradeneeded = function(e) {
	(db = e.target.result)
	.createObjectStore("myStore", {
			keyPath: "id",
			autoIncrement: !0
		})
		.createIndex("nameIndex", "name", {
			unique: !1
		})
}, request.onsuccess = function(e) {
	(db = e.target.result)
	.transaction(["myStore"], "readonly")
		.objectStore("myStore")
		.openCursor()
		.onsuccess = function(e) {
			let t = e.target.result;
			t && (data.push(t.value), t.continue())
		}
}, request.onerror = function(e) {}, chrome.runtime.onMessage.addListener(function(e, t, o) {
	if (e.getDataFromIndexedDB && o({
		dataFromIndexedDB: data
	}), e.dataToBackground) {
		let t = db.transaction(["myStore"], "readwrite");
		t.objectStore("myStore")
			.add({
				name: e.dataToBackground.name,
				url: e.dataToBackground.url,
				videoTime: e.dataToBackground.videoTime
			}), data.push({
				name: e.dataToBackground.name,
				url: e.dataToBackground.url,
				videoTime: e.dataToBackground.videoTime
			}), t.oncomplete = function() {
				o({
					success: !0
				})
			}
	}
	if (e.deleteValueFromIndexedDB) {
		let t, n = db.transaction(["myStore"], "readwrite")
			.objectStore("myStore"),
			r = e.deleteValueFromIndexedDB;
		n.openCursor()
			.onsuccess = function(e) {
				let a = e.target.result;
				if (a) {
					let e = a.value;
					e.name === r && (t = n.delete(a.primaryKey), data.pop(e), t.onsuccess = function() {
						o({
							success: !0
						})
					}), a.continue()
				}
			}
	}
}), chrome.webNavigation.onCompleted.addListener(function(e) {
	chrome.tabs.query({
		active: !0,
		currentWindow: !0
	}, function(e) {
		chrome.storage.local.get(["time", "url"])
			.then(t => {
				let o = e[0];
				t.url === o.url && setTimeout(function() {
					chrome.scripting.executeScript({
						target: {
							tabId: e[0].id
						},
						function: function(e) {
							let t = document.querySelector("video");
							t && (t.currentTime = e)
						},
						args: [t.time]
					})
				}, 1e3)
			})
	})
});