/*
 * Live2D
 * https://gitee.com/JokerPan12/live2d
 */

function loadWidget(config) {
  let { waifuPath, apiPath, cdnPath } = config;
  let useCDN = false, modelList;
  if (typeof cdnPath === "string") {
    useCDN = true;
    if (!cdnPath.endsWith("/")) cdnPath += "/";
  } else if (typeof apiPath === "string") {
    if (!apiPath.endsWith("/")) apiPath += "/";
  } else {
    console.error("Invalid initWidget argument!");
    return;
  }
  localStorage.removeItem("waifu-display");
  sessionStorage.removeItem("waifu-text");
  document.body.insertAdjacentHTML("beforeend", `
    <div id="waifu">
			<div id="waifu-tips"></div>
			<canvas id="live2d" width="800" height="800"></canvas>
			<div id="waifu-tool" style="font-size: 14px;">
             <span class="fui-home" style="line-height: 20px;"><img src="../icons/comment.svg"/></span>
             <span class="fui-chat" title="飞机大战" style="line-height: 20px;"><img src="../icons/game_fill.svg"/></span>
             <span class="fui-eye" title="变装" style="line-height: 20px;"><img src="../icons/attention_fill.svg"/></span>
             <span class="fui-photo" title="拍照" style="line-height: 20px;"><img src="../icons/Camera2.svg"/></span>
             <span class="fui-info-circle" title="更多" style="line-height: 20px;"><img src="../icons/explore_fill.svg"/></span>
             <span class="fui-cross" title="关闭看板娘" style="line-height: 20px;"><img src="../icons/round_close_fill.svg"/></span>
			</div>
		</div>`);

  setTimeout(() => {
    document.getElementById("waifu").style.bottom = '-250px';
  }, 0);

 
  function showMessage(text, timeout, priority) {
    if (!text || (sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") > priority)) return;
    if (messageTimer) {
      clearTimeout(messageTimer);
      messageTimer = null;
    }
    text = randomSelection(text);
    sessionStorage.setItem("waifu-text", priority);
    const tips = document.getElementById("waifu-tips");
    tips.innerHTML = text;
    tips.classList.add("waifu-tips-active");
    messageTimer = setTimeout(() => {
      sessionStorage.removeItem("waifu-text");
      tips.classList.remove("waifu-tips-active");
    }, timeout);
  }

  (function initModel() {
    let modelId = localStorage.getItem("modelId"),
      modelTexturesId = localStorage.getItem("modelTexturesId");
    if (modelId === null) {
      modelId = 0; // 模型 ID
      modelTexturesId = 53; // 材质 ID
    }
    loadModel(modelId, modelTexturesId);

    fetch(waifuPath)
      .then(response => response.json())
      .then(result => {
        window.addEventListener("mouseover", event => {
          for (let { selector, text } of result.mouseover) {
            if (!event.target.matches(selector)) continue;
            text = randomSelection(text);
            text = text.replace("{text}", event.target.innerText);
            showMessage(text, 4000, 8);
            return;
          }
        });
        window.addEventListener("click", event => {
          for (let { selector, text } of result.click) {
            if (!event.target.matches(selector)) continue;
            text = randomSelection(text);
            text = text.replace("{text}", event.target.innerText);
            showMessage(text, 4000, 8);
            return;
          }
        });
        result.seasons.forEach(({ date, text }) => {
          const now = new Date(),
            after = date.split("-")[0],
            before = date.split("-")[1] || after;
          if ((after.split("/")[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split("/")[0]) && (after.split("/")[1] <= now.getDate() && now.getDate() <= before.split("/")[1])) {
            text = randomSelection(text);
            text = text.replace("{year}", now.getFullYear());
            //showMessage(text, 7000, true);
            messageArray.push(text);
          }
        });
      });
  })();

  // (function live2dMove() {
  //   var body = document.getElementById("waifu");
  //   body.onmousedown = function (downEvent) {
  //     var location = {
  //       x: downEvent.clientX - this.offsetLeft,
  //       y: downEvent.clientY - this.offsetTop
  //     };
  //
  //     function move(moveEvent) {
  //       body.classList.add("active");
  //       body.classList.remove("right");
  //       body.style.left = (moveEvent.clientX - location.x) + 'px';
  //       body.style.top  = (moveEvent.clientY - location.y) + 'px';
  //       body.style.bottom = "auto";
  //     }
  //
  //     document.addEventListener("mousemove", move);
  //     document.addEventListener("mouseup", function () {
  //       body.classList.remove("active");
  //       document.removeEventListener("mousemove", move);
  //     });
  //   };
  // })();


  async function loadModelList() {
    const response = await fetch(`${cdnPath}model_list.json`);
    modelList = await response.json();
  }

  /**
   * useapi 好看的模型[1-53;1-40]
   * @param modelId
   * @param modelTexturesId
   * @param message
   * @returns {Promise<void>}
   */
  async function loadModel(modelId, modelTexturesId, message) {
    localStorage.setItem("modelId", modelId);
    localStorage.setItem("modelTexturesId", modelTexturesId);
    showMessage(message, 4000, 10);
    if (useCDN) {
      if (!modelList) await loadModelList();
      const target = randomSelection(modelList.models[modelId]);
      loadlive2d("live2d", `${cdnPath}model/${target}`);
    } else {
      loadlive2d("live2d", `${apiPath}get/?id=${modelId}-${modelTexturesId}`);
      console.log(`Live2D 模型 ${modelId}-${modelTexturesId} 加载完成`);
    }
  }

  async function loadRandModel() {
    const modelId = localStorage.getItem("modelId"),
      modelTexturesId = localStorage.getItem("modelTexturesId");
    if (useCDN) {
      if (!modelList) await loadModelList();
      const target = randomSelection(modelList.models[modelId]);
      loadlive2d("live2d", `${cdnPath}model/${target}/index.json`);
      showMessage("我的新衣服好看嘛？", 4000, 10);
    } else {
      // 可选 "rand"(随机), "switch"(顺序)
      fetch(`${apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`)
        .then(response => response.json())
        .then(result => {
          if (result.textures.id === 1 && (modelTexturesId === 1 || modelTexturesId === 0)) showMessage("我还没有其他衣服呢！", 4000, 10);
          else loadModel(modelId, result.textures.id, "我的新衣服好看嘛？");
        });
    }
  }

  async function loadOtherModel() {
    let modelId = localStorage.getItem("modelId");
    if (useCDN) {
      if (!modelList) await loadModelList();
      const index = (++modelId >= modelList.models.length) ? 0 : modelId;
      loadModel(index, 0, modelList.messages[index]);
    } else {
      fetch(`${apiPath}switch/?id=${modelId}`)
        .then(response => response.json())
        .then(result => {
          loadModel(result.model.id, 0, result.model.message);
        });
    }
  }
}

function initWidget(config, apiPath) {
  if (typeof config === "string") {
    config = {
      waifuPath: config,
      apiPath
    };
  }
  document.body.insertAdjacentHTML("beforeend", `<div id="waifu-toggle">
			<span>我在这呢</span>
		</div>`);
  const toggle = document.getElementById("waifu-toggle");
  toggle.addEventListener("click", () => {
    toggle.classList.remove("waifu-toggle-active");
    if (toggle.getAttribute("first-time")) {
      loadWidget(config);
      toggle.removeAttribute("first-time");
    } else {
      localStorage.removeItem("waifu-display");
      document.getElementById("waifu").style.display = "";
      setTimeout(() => {
        document.getElementById("waifu").style.bottom = '-250px';
      }, 0);
    }
  });
  if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
    toggle.setAttribute("first-time", true);
    setTimeout(() => {
      toggle.classList.add("waifu-toggle-active");
    }, 0);
  } else {
    loadWidget(config);
  }
  console.log(`
  く__,.ヘヽ.        /  ,ー､ 〉
           ＼ ', !-─‐-i  /  /´
           ／｀ｰ'       L/／｀ヽ､
         /   ／,   /|   ,   ,       ',
       ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
        ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
          !,/7 '0'     ´0iソ|    |
          |.从"    _     ,,,, / |./    |
          ﾚ'| i＞.､,,__  _,.イ /   .i   |
            ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
              | |/i 〈|/   i  ,.ﾍ |  i  |
             .|/ /  ｉ：    ﾍ!    ＼  |
              kヽ>､ﾊ    _,.ﾍ､    /､!
              !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
              ﾚ'ヽL__|___i,___,ンﾚ|ノ
                  ﾄ-,/  |___./
                  'ｰ'    !_,.:
`);
}
