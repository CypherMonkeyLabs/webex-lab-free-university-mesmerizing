
    try {
      var saved = JSON.parse(localStorage.getItem("webexlab.settings") || "{}");
      if (saved.theme) document.documentElement.dataset.theme = saved.theme;
      if (saved.motion) document.documentElement.dataset.motion = saved.motion;
      if (saved.font) document.documentElement.style.setProperty("--cc-font", saved.font + "px");
    } catch (error) { /* keep the default theme */ }
  
