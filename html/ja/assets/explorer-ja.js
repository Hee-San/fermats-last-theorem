/* ja/thm.html: 日本語版の定理ページ。assets/explorer.js の日本語版で、49 件のランドマーク定理は
   window.FLT_THM_JA (data/thm_ja.js) にある日本語の解説で上書きする。それ以外の定理は英語版と同じ
   命題・引用関係・近傍グラフを表示し、非形式的な解説だけ英語のまま(その旨を明記する)。 */
(function () {
  "use strict";
  var FLT = window.FLT, esc = FLT.esc, fmt = FLT.fmt;
  FLT.thmHref = function (i) { return "thm.html#" + FLT.M.names[i]; };   // keep the interactive graph inside ja/thm.html rather than jumping to the English page
  var main = document.getElementById("thm-main");
  var JA_NOTE_TRANSLATED = "日本語の解説は英語の原文を人手で翻訳したものです。証明されたのは上の Lean の命題文であり、この文章は読むための補助です。";
  var JA_NOTE_FALLBACK = "この定理の解説はまだ日本語訳がありません。以下は自動生成された英語の解説です(Lean の命題文自体は上に示したとおりです)。";
  var JA_REFNOTE = "参考文献は自動的に提案されたもので、個別には検証されていません。";
  var STAGE_JA = {
    "The statement": "主定理",
    "Reduction to prime exponents p ≥ 5": "素数指数 p ≥ 5 への帰着",
    "The Frey package": "Frey パッケージ",
    "Irreducibility (Mazur; exponents 5, 7, 11, 13 settled directly)": "既約性(Mazur；指数 5, 7, 11, 13 は直接解決)",
    "Modularity (Wiles, Taylor–Wiles)": "モジュラー性(Wiles, Taylor–Wiles)",
    "Level lowering (Ribet)": "レベル下げ(Ribet)",
    "No weight-2 cusp forms of level 2": "レベル 2 の重さ 2 カスプ形式は存在しない"
  };
  function byHash() {
    var h = decodeURIComponent((window.location.hash || "").replace(/^#/, ""));
    var ll = document.getElementById("lang-link"); if (ll) ll.href = "../thm.html" + (window.location.hash || "");
    FLT.withMeta(function (err) {
      if (err || !FLT.M) { main.innerHTML = '<p class="warn">サイトのデータ(data/meta.js)を読み込めませんでした。この html/ja/thm.html を html/ フォルダの外に移動した場合は、元の位置に戻してください。</p>'; return; }
      if (!h) { renderLanding(); return; }
      var mh = /^(?:x|mu|md):(\d+)$/.exec(h);
      if (mh && +mh[1] < FLT.M.N) { try { history.replaceState(null, "", "#" + FLT.M.names[+mh[1]]); } catch (e) { } renderTheorem(+mh[1]); return; }
      var i = FLT.indexOf(h);
      if (i < 0) { renderNotFound(h); return; }
      if (FLT.M.names[i] !== h) { try { history.replaceState(null, "", "#" + FLT.M.names[i]); } catch (e) { } }
      renderTheorem(i);
    });
  }
  window.addEventListener("hashchange", byHash);
  byHash();

  function renderLanding() {
    var M = FLT.M, m = M.m;
    document.title = "定理 · FLT in Lean 4（日本語）";
    var lms = []; for (var i = 0; i < M.N; i++) if (m.lm[i]) lms.push(i);
    lms.sort(function (a, b) { return m.depth[a] - m.depth[b] || (M.names[a] < M.names[b] ? -1 : 1); });
    main.innerHTML = '<h1>全 ' + fmt(M.N) + ' 件の定理</h1><p>検索ボックスに名前(の一部)を入力するか、ランドマーク定理から始めてください(49 件すべて日本語訳つき):</p><ul class="lm-list">' +
      lms.map(function (i) { var t = jaTitleText(M.names[i]) || FLT.title(i); return '<li><a href="#' + esc(M.names[i]) + '">' + (t ? esc(t) + ' <code>' + esc(M.names[i]) + '</code>' : '<code>' + esc(M.names[i]) + '</code>') + '</a> <span class="muted">下位 ' + fmt(m.below[i]) + ' 件</span></li>'; }).join("") + "</ul>";
  }
  function renderNotFound(h) {
    document.title = "見つかりません · FLT in Lean 4（日本語）";
    var res = FLT.search(h.replace(/[._]/g, " "), 30);
    main.innerHTML = '<h1><code>' + esc(h) + '</code> という名前の定理はありません</h1>' + (res.length ? '<p>近い名前:</p><ul>' + res.filter(function (r) { return r.kind === "thm"; }).map(function (r) { return '<li><a href="#' + esc(FLT.M.names[r.i]) + '"><code>' + esc(FLT.M.names[r.i]) + '</code></a></li>'; }).join("") + '</ul>' : "");
  }
  // ランドマークの日本語タイトル。titles.js の英語タイトルと同じ約束で、プレーンテキストに Unicode の数学記号
  // (≥, Γ₀, ρ̄_{W,3}, …) を混ぜたもの — HTML も LaTeX も含まない。breadcrumb・引用一覧・一覧ページでそのまま使える。
  function jaTitleText(name) {
    return (window.FLT_THM_JA && window.FLT_THM_JA[name] && window.FLT_THM_JA[name].title) || null;
  }
  function thmLink(i, withNums) {
    var M = FLT.M, name = M.names[i], t = jaTitleText(name) || FLT.title(i), lm = M.m.lm[i] ? '<span class="badge lm" title="証明の道筋の文書で名前が挙がっているランドマーク定理">ランドマーク</span> ' : "";
    return '<a class="thm-ref" href="#' + esc(name) + '">' + lm + (t ? '<span class="t">' + esc(t) + '</span> ' : "") + '<code>' + esc(name) + '</code></a>' +
      (withNums ? ' <span class="muted nums">下位 ' + fmt(M.m.below[i]) + ' 件 · 深さ ' + M.m.depth[i] + '</span>' : "");
  }
  function renderTheorem(i) {
    var M = FLT.M, m = M.m, name = M.names[i], ja = window.FLT_THM_JA && window.FLT_THM_JA[name], t = (ja && ja.title ? jaTitleText(name) : null) || FLT.title(i), stem = FLT.stem(i);
    document.title = (t || FLT.shortName(name)) + " · FLT in Lean 4（日本語）";
    var cites = FLT.cites(i), citedBy = FLT.citedBy(i);
    citedBy.sort(function (a, b) { return (m.lm[b] - m.lm[a]) || (m.depth[a] - m.depth[b]) || (M.names[a] < M.names[b] ? -1 : 1); });
    var path = FLT.pathToRoot(i);
    var stageName = FLT.stageName(m.stage[i]);
    if (stageName) stageName = STAGE_JA[stageName] || stageName;
    var H = [];
    var crumbs = path.slice().reverse();
    var nOther = 0;
    function crumb(v, k) {
      var lab = jaTitleText(M.names[v]) || FLT.title(v) || FLT.shortName(M.names[v]);
      var pk = m.pkind[v], hop = "";
      if (k > 0 && pk && pk !== "cites") {
        nOther++;
        hop = pk.indexOf("definition:") === 0 ? '<span class="hop" title="引用ではない: 直前の定理は定義モジュール Def_' + esc(pk.slice(11)) + ' を使っており、それがこの定理をインポートしている">経由 <a href="' + (window.FLT_ROOT || "") + 'def/' + esc(pk.slice(11)) + '.html">Def_' + esc(pk.slice(11)) + '</a> ›</span> ' : '<span class="hop" title="引用ではない: 直前の定理の命題文がこの定理に言及している">命題文が言及 ›</span> ';
      }
      return hop + ((k === crumbs.length - 1) ? '<span class="here">' + esc(lab) + '</span>' : '<a href="#' + esc(M.names[v]) + '" title="' + esc(M.names[v]) + '">' + esc(lab) + '</a>');
    }
    var pc = crumbs.map(function (v, k) { return crumb(v, k); });
    var nCite = crumbs.length - 1 - nOther;
    var countTxt = nCite + ' 件の引用' + (nOther ? (' + 定義/命題を経由 ' + nOther + ' 回') : "");
    if (pc.length > 9) { pc = pc.slice(0, 4).concat(['<a href="javascript:void(0)" class="path-more" title="経路をすべて表示">… 残り ' + (pc.length - 8) + ' 件 …</a>']).concat(pc.slice(-4)); }
    H.push('<nav class="path" aria-label="フェルマーの最終定理からこの定理までの最短経路の一つ"><span class="muted">FLT からの経路(' + countTxt + '):</span> ' + pc.join(' <span class="sep">›</span> ') + '</nav>');
    H.push('<header class="thm-head">' + (t ? '<h1 class="math-scope">' + esc(t) + '</h1><div class="lean-name"><code>' + esc(name) + '</code></div>' : '<h1><code>' + esc(name) + '</code></h1>') + '<div class="badges">' +
      (i === m.root ? '<span class="badge root">この木の主定理</span>' : "") +
      (m.lm[i] ? '<span class="badge lm">ランドマーク: 証明の道筋の文書で名前が挙がっている</span>' : "") +
      (stageName ? '<a class="badge stage" href="route/index.html#stage-' + m.stage[i] + '">' + (m.lm[i] || i === m.root ? "" : "所属: ") + esc(stageName) + '</a>' : "") +
      (m.port && m.port[i] === 1 ? (m.portnotes ? '<a class="badge dup" href="' + (window.FLT_ROOT || "") + m.portnotes + '"' : '<span class="badge dup"') + ' title="木が Lean 4.30 から 4.33 へ移植された際に手で編集された 28 個の命題ファイルの一つ' + (m.portnotes ? '。移植ノート(§5.2)は命題が変わっていないと論じている' : '') + '">命題文が Lean 4.33 移植時に編集された' + (m.portnotes ? '</a>' : '</span>') : "") +
      (m.port && m.port[i] === 2 ? '<a class="badge dup" href="' + (window.FLT_ROOT || "") + 'def/Compat_Mathlib430.html" title="命題が Def_Compat_Mathlib430 をインポートしている: v4.33 で同じ名前のまま意味が変わった Mathlib v4.30 の定義を、新しい名前のもとで逐語的に保持したもの' + (m.portnotes ? '(移植ノート§4)' : '') + '">Mathlib v4.30 の定義を保持したものを使用</a>' : "") +
      (m.aliases && m.aliases[name] ? '<span class="badge" title="証明の道筋の文書でこのステップが呼ばれている古典的な名前">' + esc(m.aliases[name]) + '</span>' : "") +
      (m.dup[i] ? '<span class="badge dup" title="定義モジュールがすでに同じ型で同名の宣言をしているため、命題モジュールは P2M.Dup.' + esc(name) + ' として宣言されている">名前が重複する命題</span>' : "") +
      '<span class="badge proved" title="カーネルで検査済み。propext・Classical.choice・Quot.sound にのみ依存">証明済み</span></div></header>');
    H.push('<section id="en-box"></section>');
    H.push('<section><h2>Lean の命題文 <span class="muted small"><code>Theorems/Thm_' + esc(stem) + '.lean</code> より、前置き省略</span> <button class="copy small" id="copy-stmt">コピー</button></h2><div id="stmt-box"><p class="muted">命題文を読み込み中…</p></div></section>');
    H.push('<section class="numbers"><h2>数値</h2><ul class="kv">' +
      (m.below[i] > 0 ? '<li>下位に <b>' + fmt(m.below[i]) + '</b> 件の定理(その証明のインポート閉包に含まれる)</li>' : '<li>下位の定理は <b>0</b> 件: その証明は木の中のどの定理も引用せず、Mathlib と定義モジュールから直接行われています</li>') +
      '<li>直接 <b>' + cites.length + '</b> 件の定理を引用し、<b>' + citedBy.length + '</b> 件から引用されています</li>' +
      '<li><code>fermat_last_theorem</code> からの深さ <b>' + m.depth[i] + '</b>(最短引用経路)。その下位の最長の連鎖: <b>' + m.height[i] + '</b></li>' +
      '<li id="num-proof" class="muted">証明のサイズ: 読み込み中…</li></ul></section>');
    H.push('<section><h2>近傍 <span class="muted small">前提が上、結論が下。名前をクリックするとそこへ移動、<b>+</b> で展開</span></h2>' +
      '<div class="graph-tools"><button id="g-path">FLT までの経路を追加</button> <button id="g-reset">リセット</button> <label><input type="checkbox" id="g-defs" checked> 定義モジュール</label> <span class="muted small" id="g-info"></span></div>' +
      '<div id="graph" class="graph-box"><p class="muted">配置を計算中…</p></div></section>');
    H.push('<section class="two-col"><div><h2>引用 <span class="muted small">(' + cites.length + ' 件の被引用定理、インポート順)</span></h2>' + (cites.length ? '<ul class="refs" id="uses-list">' + cites.map(function (v) { return "<li>" + thmLink(v, true) + "</li>"; }).join("") + "</ul>" : '<p class="muted">木の中のどの定理も引用していません: Mathlib と定義だけから証明されています。</p>') +
      '<div id="uses-defs"></div></div>' +
      '<div><h2>被引用 <span class="muted small">(' + citedBy.length + ' 件)</span></h2>' + (citedBy.length ? '<ul class="refs" id="usedby">' + citedBy.slice(0, 60).map(function (v) { return "<li>" + thmLink(v, true) + "</li>"; }).join("") + "</ul>" + (citedBy.length > 60 ? '<p><a href="javascript:void(0)" id="usedby-all">全 ' + citedBy.length + ' 件を表示</a></p>' : "") : '<p class="muted">' + (i === m.root ? "これがこの木の最終定理です。" : "どの証明モジュールもこれを引用していません" + (m.pkind[i] && m.pkind[i] !== "cites" ? "。" + esc(m.pkind[i].indexOf("definition:") === 0 ? "定義モジュール Def_" + m.pkind[i].slice(11) + " を通じて到達します(それがこれをインポートしています)" : "これに言及する命題を通じて到達します") + "。" : "。")) + "</p>") + "</div></section>");
    H.push('<section id="source-box"><h2>ソース</h2><p class="muted">読み込み中…</p></section>');
    main.innerHTML = H.join("");
    window.scrollTo(0, 0);
    var pm = main.querySelector(".path-more");
    if (pm) pm.addEventListener("click", function () { nOther = 0; var full = crumbs.map(function (v, k) { return crumb(v, k); }); main.querySelector("nav.path").innerHTML = '<span class="muted">FLT からの経路(' + countTxt + '):</span> ' + full.join(' <span class="sep">›</span> '); });
    var ua = document.getElementById("usedby-all");
    if (ua) ua.addEventListener("click", function () { document.getElementById("usedby").innerHTML = citedBy.map(function (v) { return "<li>" + thmLink(v, true) + "</li>"; }).join(""); ua.parentNode.removeChild(ua); });
    var g = new FLT.Graph(document.getElementById("graph"), i, { onDraw: function (s) { document.getElementById("g-info").textContent = s.nodes + " 個のノード · " + s.ms + " ms で配置"; } });
    document.getElementById("g-path").addEventListener("click", function () { g.addPathToRoot(); });
    document.getElementById("g-reset").addEventListener("click", function () { g.reset(); });
    document.getElementById("g-defs").addEventListener("change", function (ev) { g.showDefs = ev.target.checked; g.draw(); });
    FLT.withRecord(name, function (r) {
      if (FLT.M.names[i] !== decodeURIComponent((window.location.hash || "").slice(1))) return;
      if (!r) { document.getElementById("stmt-box").innerHTML = '<p class="warn">この定理のデータシャードを読み込めませんでした。</p>'; g.draw(); return; }
      g.defs = r.sd || []; g.draw();
      // 日本語(あれば)、なければ英語シャードの en フィールドにフォールバック
      var en = r.en || {};
      if (ja || en) {
        var E = [], P = [];
        // h1 already shows the right plain title (t, set when the page skeleton was built above); only the rarer
        // English shard override (real inline math, HTML) needs a second pass, and only when we have no Japanese title.
        if (!(ja && ja.title) && en.title_html) { var h1b = main.querySelector("header.thm-head h1"); if (h1b) h1b.innerHTML = en.title_html; }
        var contextHtml = ja && ja.context || en.context_html;
        if (contextHtml) { var cx = document.createElement("div"); cx.className = "en-context lead"; cx.innerHTML = contextHtml; var hd = main.querySelector("header.thm-head"); hd.parentNode.insertBefore(cx, hd.nextSibling); }
        var statementHtml = ja && ja.statement || en.statement_html;
        if (statementHtml) E.push('<h2>非形式的な命題' + (ja && ja.statement ? "" : ' <span class="muted small">(英語)</span>') + ' <span class="muted small">読むための補助であり、証明されたのは上の Lean の命題文です</span></h2><div class="en">' + statementHtml + '</div>');
        var strengthHtml = ja && ja.strength || en.strength_html;
        if (strengthHtml) E.push('<div class="strength"><h3>古典的な定理と比べて</h3>' + strengthHtml + '</div>');
        if (statementHtml || (ja && ja.proof) || en.proof_html || contextHtml) E.push('<p class="muted small en-note">' + esc(ja && (ja.statement || ja.proof || ja.context) ? JA_NOTE_TRANSLATED : JA_NOTE_FALLBACK) + '</p>');
        document.getElementById("en-box").innerHTML = E.join("");
        var proofHtml = ja && ja.proof || en.proof_html;
        if (proofHtml) P.push('<h2>証明のアイデア <span class="muted small">(非形式的' + (ja && ja.proof ? "" : "・英語") + ')</span></h2><div class="en-context">' + proofHtml + '</div>');
        if (en.references_html && en.references_html.length) P.push('<h3>参考文献</h3><ol class="refs-lit small">' + en.references_html.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ol><p class="muted small">' + esc(JA_REFNOTE) + '</p>');
        if (P.length) { var ps = document.createElement("section"); ps.innerHTML = P.join(""); var sb = document.getElementById("stmt-box").parentNode; sb.parentNode.insertBefore(ps, sb.nextSibling); }
        FLT.renderMath(main);
      }
      var ctx = (r.cx || []), S = [];
      var resolve = FLT.makeResolver(ctx, name, r.dc);
      var resolveP = r.so && r.so.tail ? FLT.makeResolver(ctx.concat(r.so.tail.split("\n")), name, r.so.tail) : resolve;
      if (ctx.length) S.push('<pre class="lean ctx" title="命題モジュールの文脈行: open している名前空間・variable・option">' + FLT_highlightLean(ctx.join("\n"), null, resolve) + '</pre>');
      S.push('<pre class="lean stmt">' + FLT_highlightLean(r.dc, name, resolve) + ' <span class="c1">:= … </span></pre>');
      if (r.tr && r.tr.length) S.push('<pre class="lean ctx">' + FLT_highlightLean(r.tr.join("\n"), null, resolve) + '</pre>');
      if (r.ml && r.ml.length && !(r.ml.length === 1 && r.ml[0] === "Mathlib")) S.push('<p class="muted small">命題ファイルの Mathlib インポート: ' + r.ml.map(function (x) { return m.mathlibDocs ? '<a class="ext" href="' + m.mathlibDocs + x.replace(/\./g, "/") + '.html" title="外部リンク: このモジュールの mathlib4 ドキュメント(現在の Mathlib を反映しており、必ずしも v4.33.0 とは限らない)。クリックするまで何も取得されない"><code>' + esc(x) + '</code> ↗</a>' : '<code>' + esc(x) + '</code>'; }).join(", ") + '</p>');
      document.getElementById("stmt-box").innerHTML = S.join("");
      document.getElementById("copy-stmt").setAttribute("data-copy", (ctx.length ? ctx.join("\n") + "\n" : "") + r.dc);
      var D = [];
      if (r.sd && r.sd.length) D.push('<h3>命題ファイルがインポートする定義モジュール</h3><ul class="refs defs">' + r.sd.map(function (d) { return '<li><a href="' + FLT.defHref(d) + '"><code>Def_' + esc(m.defs[d]) + '</code></a></li>'; }).join("") + '</ul>');
      var pdOnly = (r.pd || []).filter(function (d) { return !r.sd || r.sd.indexOf(d) < 0; });
      if (pdOnly.length) D.push('<h3>証明がインポートするその他の定義モジュール</h3><ul class="refs defs">' + pdOnly.map(function (d) { return '<li><a href="' + FLT.defHref(d) + '"><code>Def_' + esc(m.defs[d]) + '</code></a></li>'; }).join("") + '</ul>');
      if (r.st && r.st.length) D.push('<h3>命題文自体が言及する定理</h3><ul class="refs">' + r.st.map(function (v) { return '<li>' + thmLink(v, false) + '</li>'; }).join("") + '</ul>');
      document.getElementById("uses-defs").innerHTML = D.join("");
      if (r.cu && r.cu.length === cites.length) {
        var lis = main.querySelectorAll("#uses-list > li");
        for (var q = 0; q < lis.length && q < r.cu.length; q++) {
          var c = r.cu[q], sp = document.createElement("span");
          sp.className = "muted nums cu"; sp.textContent = c === null ? "" : (c > 0 ? " · 証明中に " + c + " 回出現" : " · インポートされているが証明本文には現れない");
          if (c === 0) sp.className += " warnish";
          lis[q].appendChild(sp);
        }
      }
      if (r.proof_html) {
        var det = document.createElement("section");
        det.innerHTML = '<h2>証明モジュール <span class="muted small">インポートと自動生成された前置きを除いて ' + fmt(r.proof_lines) + ' 行。ファイル内の補助定理が先、<code>solution</code> が最後</span></h2><details' + (r.proof_lines <= 120 ? " open" : "") + '><summary>証明本文を表示</summary><pre class="lean sol">' + r.proof_html + '</pre></details>';
        document.getElementById("source-box").parentNode.insertBefore(det, document.getElementById("source-box").nextSibling);
      }
      if (r.so) document.getElementById("num-proof").outerHTML = '<li>証明モジュール: 前置きを除いて <b>' + fmt(r.so.cl) + '</b> 行(ファイル全体では ' + fmt(r.so.ln) + ' 行)、ファイル内の補助定理 <b>' + fmt(r.so.h) + '</b> 件' + (r.so.dl ? '、ローカル定義 ' + r.so.dl + ' 件' : "") + '</li>';
      var src = [];
      src.push('<ul class="src-links"><li>命題: <a href="../../Theorems/Thm_' + esc(stem) + '.lean"><code>Theorems/Thm_' + esc(stem) + '.lean</code></a> <button class="copy small" data-copy="Theorems/Thm_' + esc(stem) + '.lean">コピー</button></li>' +
        '<li>証明: <a href="../../P2M/Sol/S_' + esc(stem) + '.lean"><code>P2M/Sol/S_' + esc(stem) + '.lean</code></a> <button class="copy small" data-copy="P2M/Sol/S_' + esc(stem) + '.lean">コピー</button> <span class="muted small">(このリンクは html/ フォルダがリポジトリの直下にあるときに機能します)</span></li></ul>');
      if (r.so && r.so.tail) {
        src.push('<h3>証明の結び <span class="muted small">証明モジュールを締めくくる <code>solution</code> 宣言' + (r.so.tt ? '(全 ' + fmt(r.so.tl) + ' 行のうち最初の ' + r.so.tail.split("\n").length + ' 行' : "") + '、' + fmt(r.so.sl) + ' 行目' + (r.so.tt ? ')' : '') + '</span></h3><pre class="lean sol">' + FLT_highlightLean(r.so.tail, null, resolveP) + (r.so.tt ? '\n<span class="c1">  … ファイル内で続く</span>' : "") + '</pre>');
      }
      document.getElementById("source-box").innerHTML = '<h2>ソース</h2>' + src.join("");
      FLT.wireCopyButtons(main);
      FLT.fixRepoLinks(main);
    });
  }
})();
