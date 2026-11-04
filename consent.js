
/* KR Travel アクセス解析の同意管理 */

(() => {
  "use strict";

  const STORAGE_KEY = "krtravel_analytics_consent_v1";
  const GTM_ID = "GTM-PN69L3W8";

  const denied = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };

  const granted = {
    ...denied,
    analytics_storage: "granted"
  };

  // Googleタグより先に同意状態を設定する
  window.dataLayer = window.dataLayer || [];

  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", denied);

  let gtmLoaded = false;

  function getChoice() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // 保存できない場合、次の訪問時に再確認する
    }
  }

  function loadGTM() {
    if (gtmLoaded) return;

    gtmLoaded = true;

    window.gtag("consent", "update", granted);
    window.gtag("js", new Date());

    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtm.js?id=" +
      GTM_ID;

    document.head.appendChild(script);
  }

  function choose(choice) {
    saveChoice(choice);

    if (choice === "granted") {
      loadGTM();
    } else if (gtmLoaded) {
      // 読み込み済みのタグを停止するため再読み込み
      window.location.reload();
      return;
    }

    const banner = document.getElementById(
      "kr-consent-banner"
    );

    if (banner) banner.hidden = true;
  }

  function showBanner() {
    let banner = document.getElementById(
      "kr-consent-banner"
    );

    if (!banner) {
      banner = document.createElement("section");
      banner.id = "kr-consent-banner";
      banner.setAttribute("role", "region");
      banner.setAttribute(
        "aria-label",
        "アクセス解析の設定"
      );

      banner.innerHTML = `
        <div class="kr-consent-inner">
          <p><strong>アクセス解析について</strong></p>
          <p>
            当サイトでは記事の改善のため、
            Google Analyticsを使用します。
            許可しなくても記事を閲覧できます。
          </p>
          <p>
            <a href="privacy.html">
              プライバシーについて
            </a>
          </p>
          <div class="kr-consent-actions">
            <button type="button" data-choice="denied">
              拒否する
            </button>
            <button type="button" data-choice="granted">
              許可する
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(banner);

      banner.querySelectorAll("[data-choice]")
        .forEach((button) => {
          button.addEventListener("click", () => {
            choose(button.dataset.choice);
          });
        });
    }

    banner.hidden = false;
  }

  // 過去に許可されている場合だけ計測を開始
  const savedChoice = getChoice();

  if (savedChoice === "granted") {
    loadGTM();
  }

  function initialize() {
    if (
      savedChoice !== "granted" &&
      savedChoice !== "denied"
    ) {
      showBanner();
    }

    // 次の工程でフッターに追加する設定ボタン
    document.querySelectorAll(
      "[data-consent-settings]"
    ).forEach((button) => {
      button.addEventListener("click", showBanner);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();
