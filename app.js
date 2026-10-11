/* ===== 排班管理系统 =====
 * 数据模型：
 *   shiftTypes: [{ id, name, color, start, end }]           排班模式（班次类型）
 *   teams:      [{ id, name }]                               班组
 *   staff:      [{ id, name, teamId, phone, note }]          人员
 *   schedule:   { "YYYY-MM-DD": { [teamId|staffId]: shiftTypeId } }
 *               排班记录：同一班组共用一套排班（key 为班组 id），未分组人员按个人排班（key 为人员 id）
 */
(function () {
  "use strict";

  var STORAGE_KEY = "carane-shift-scheduler-data-v1";

  /* ===== 默认数据（由备份导入，2026-10 排班） ===== */
  var DEFAULT_DATA = {
    shiftTypes: [
      { id: "mv3teyfr4oswz", name: "白班", color: "#2563eb", start: "07:00", end: "19:00" },
      { id: "mv3teyfrsfc45", name: "夜班", color: "#6d28d9", start: "19:00", end: "07:00" },
      { id: "mv3teyfrv715e", name: "白", color: "#10b981", start: "07:00", end: "19:00" },
      { id: "mv3u1om5qzdcg", name: "休息", color: "#10b981", start: "", end: "" }
    ],
    teams: [
      { id: "mv3teyfrsyv9c", name: "一班", rule: { seq: ["mv3teyfr4oswz", "mv3teyfr4oswz", "mv3u1om5qzdcg"] } },
      { id: "mv3teyfr4ppjs", name: "二班", rule: { seq: ["mv3u1om5qzdcg", "mv3teyfr4oswz", "mv3teyfr4oswz"] } },
      { id: "mv3u91evidput", name: "三班", rule: { seq: ["mv3teyfr4oswz", "mv3u1om5qzdcg", "mv3teyfr4oswz"] } }
    ],
    staff: [
      { id: "mv3teyfr8zibq", name: "张伟", teamId: "mv3teyfrsyv9c", phone: "138****1234", note: "" },
      { id: "mv3teyfrb82yb", name: "刘元龙", teamId: "mv3teyfr4ppjs", phone: "", note: "" },
      { id: "mv3u9g60hn24w", name: "王卫华", teamId: "mv3u91evidput", phone: "", note: "" },
      { id: "mv3ublr63rcw8", name: "张威", teamId: "mv3u91evidput", phone: "", note: "" }
    ],
    schedule: {
      "2026-10-01": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-02": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-03": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-04": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-05": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-06": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-07": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-08": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-09": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-10": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-11": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-12": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-13": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-14": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-15": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-16": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-17": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-18": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-19": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-20": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-21": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-22": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-23": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-24": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-25": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-26": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-27": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-28": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-29": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3u1om5qzdcg" },
      "2026-10-30": { "mv3teyfrsyv9c": "mv3u1om5qzdcg", "mv3teyfr4ppjs": "mv3teyfr4oswz", "mv3u91evidput": "mv3teyfr4oswz" },
      "2026-10-31": { "mv3teyfrsyv9c": "mv3teyfr4oswz", "mv3teyfr4ppjs": "mv3u1om5qzdcg", "mv3u91evidput": "mv3teyfr4oswz" }
    }
  };

  var state = {
    shiftTypes: [],
    teams: [],
    staff: [],
    schedule: {},
    year: null,
    month: null, // 0-11
    editing: null // 当前弹窗编辑对象
  };

  var els = {};
  var popover = { open: false, staffId: null, dateKey: null };

  /* ===== 工具函数 ===== */
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function dateKey(y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); }

  function today() {
    var t = new Date();
    return { year: t.getFullYear(), month: t.getMonth(), day: t.getDate() };
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function byId(id) { return document.getElementById(id); }

  function fmtTime(t) {
    if (!t) return "不设时间";
    return t;
  }

  /* 班次时间范围：休息类（不设时间）显示"不设时间" */
  function fmtRange(s) {
    if (!s.start && !s.end) return "不设时间";
    return fmtTime(s.start) + "–" + fmtTime(s.end);
  }

  /* 中文天数序号：第1天、第2天…… */
  function ordinalCn(i) {
    var nums = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
      "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十"];
    return "第" + (i < nums.length ? nums[i] : (i + 1)) + "天";
  }

  /* 轮班规则标签：第1天 白班 · 第2天 白班 · 第3天 夜班 …… */
  function ruleLabel(team) {
    if (!team || !team.rule || !team.rule.seq.length) return "";
    return team.rule.seq.map(function (sid, i) {
      var s = findShift(sid);
      return ordinalCn(i) + " " + (s ? s.name : "");
    }).join(" · ");
  }

  /* ===== 存储 ===== */
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        state.shiftTypes = data.shiftTypes || [];
        state.teams = data.teams || [];
        state.staff = data.staff || [];
        state.schedule = data.schedule || {};
        migrateSchedule();
        if (ensureRestShift()) save();
        return;
      }
    } catch (e) { /* 数据损坏则重置 */ }
    seedData();
  }

  /* 确保排班模式中存在「休息」班次：不设定时间，两个工作班次之间的时间即休息 */
  function ensureRestShift() {
    var hasUntimed = state.shiftTypes.some(function (s) { return !s.start && !s.end; });
    if (!hasUntimed) {
      state.shiftTypes.push({ id: uid(), name: "休息", color: "#10b981", start: "", end: "" });
      return true;
    }
    return false;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      shiftTypes: state.shiftTypes,
      teams: state.teams,
      staff: state.staff,
      schedule: state.schedule
    }));
  }

  /* 首次使用：写入默认排班数据（备份导入） */
  function seedData() {
    var data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    state.shiftTypes = data.shiftTypes;
    state.teams = data.teams;
    state.staff = data.staff;
    state.schedule = data.schedule;
    save();
  }

  /* ===== 视图路由 ===== */
  function currentView() {
    var v = location.hash.replace(/^#\//, "");
    return ["calendar", "shifts", "teams", "staff"].indexOf(v) >= 0 ? v : "calendar";
  }

  function renderView(view) {
    document.querySelectorAll(".view").forEach(function (sec) {
      sec.classList.toggle("hidden", sec.id !== "view-" + view);
    });
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.classList.toggle("active", tab.dataset.view === view);
    });
    if (view === "calendar") renderCalendar();
    if (view === "shifts") renderShifts();
    if (view === "teams") renderTeams();
    if (view === "staff") renderStaff();
  }

  /* ===== 日历 ===== */
  function buildMonthCells(year, month) {
    var firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // 周一=0
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var prevDays = new Date(year, month, 0).getDate();
    var cells = [];
    for (var i = firstDow - 1; i >= 0; i--) {
      cells.push({ year: year, month: month, day: prevDays - i, inMonth: false });
    }
    for (var d = 1; d <= daysInMonth; d++) {
      cells.push({ year: year, month: month, day: d, inMonth: true });
    }
    var next = 1;
    while (cells.length % 7 !== 0) {
      var nm = month + 1 === 12 ? 0 : month + 1;
      var ny = month + 1 === 12 ? year + 1 : year;
      cells.push({ year: ny, month: nm, day: next++, inMonth: false });
    }
    return cells;
  }

  function renderCalendar() {
    var t = today();
    var cells = buildMonthCells(state.year, state.month);
    var firstDate = new Date(state.year, state.month, 1);
    var monthLabel = firstDate.getFullYear() + " 年 " + (firstDate.getMonth() + 1) + " 月";
    els.monthLabel.textContent = monthLabel;

    // 图例
    var legendHtml = "";
    state.shiftTypes.forEach(function (s) {
      legendHtml +=
        '<span class="legend-item"><span class="legend-swatch" style="background:' + esc(s.color) + '"></span>' +
        esc(s.name) + " " + esc(fmtRange(s)) + "</span>";
    });
    els.legend.innerHTML = legendHtml;

    var hasStaff = state.staff.length > 0;
    els.calendarEmpty.classList.toggle("hidden", hasStaff);
    els.calendarWrap.classList.toggle("hidden", !hasStaff);
    if (!hasStaff) return;

    // 列头
    var dayNames = ["一", "二", "三", "四", "五", "六", "日"];
    var headHtml = "<tr><th style=\"min-width:130px\"></th>";
    cells.forEach(function (c, ci) {
      var isToday = c.inMonth && c.year === t.year && c.month === t.month && c.day === t.day;
      var isWeekend = (new Date(c.year, c.month, c.day).getDay() === 0 || new Date(c.year, c.month, c.day).getDay() === 6);
      var cls = [];
      if (isWeekend) cls.push("weekend");
      if (isToday) cls.push("today-col");
      headHtml += '<th class="' + cls.join(" ") + '"><span class="day-name">' + dayNames[ci % 7] +
        "</span><span class=\"day-num\">" + c.day + "</span></th>";
    });
    headHtml += "</tr>";
    els.calendarHead.innerHTML = headHtml;

    // 行：按班组分组
    var bodyHtml = "";
    var teamRows = buildTeamRows();
    teamRows.forEach(function (group) {
      var ruleInfo = "";
      if (group.team && group.team.rule && group.team.rule.seq.length) {
        ruleInfo = '<span class="rule-preview" title="' + esc(ruleLabel(group.team)) + '">' + esc(ruleLabel(group.team)) + "</span>" +
          '<button type="button" class="rule-btn" data-auto-team="' + group.team.id + '" title="按轮班规则自动排满当月">按规则排班</button>';
      }
      if (group.team) {
        bodyHtml += '<tr><td class="group-row" colspan="' + (cells.length + 1) + '">' +
          esc(group.team.name) + '<span class="group-count">' + group.staffList.length + " 人</span>" + ruleInfo + "</td></tr>";
      } else {
        bodyHtml += '<tr><td class="group-row" colspan="' + (cells.length + 1) + '">未分组' +
          '<span class="group-count">' + group.staffList.length + " 人</span></td></tr>";
      }
      group.staffList.forEach(function (p) {
        bodyHtml += '<tr><td class="staff-cell">' + esc(p.name) +
          (p.phone ? '<span class="staff-sub">' + esc(p.phone) + "</span>" : "") + "</td>";
        cells.forEach(function (c) {
          var key = dateKey(c.year, c.month, c.day);
          var daySch = c.inMonth ? state.schedule[key] : null;
          var shiftId = null;
          if (daySch) {
            var unitId = p.teamId || p.id; // 有班组读班组排班，未分组读个人排班
            shiftId = daySch[unitId] || null;
            if (!shiftId && p.teamId) shiftId = daySch[p.id] || null; // 兼容旧个人级数据
          }
          var shift = shiftId ? findShift(shiftId) : null;
          var isToday = c.inMonth && c.year === t.year && c.month === t.month && c.day === t.day;
          var isWeekend = new Date(c.year, c.month, c.day).getDay() === 0 || new Date(c.year, c.month, c.day).getDay() === 6;
          var cls = ["date-cell"];
          if (!c.inMonth) cls.push("other-month");
          else if (isWeekend && !shift) cls.push("weekend");
          if (isToday) cls.push("today-col");
          if (shift) cls.push("has-shift");

          if (!c.inMonth) {
            bodyHtml += '<td class="' + cls.join(" ") + '" data-nav="' + dateKey(c.year, c.month, c.day) + '"><span class="cell-day">' + c.day + "</span></td>";
          } else if (shift) {
            bodyHtml += '<td class="' + cls.join(" ") + '" data-staff="' + p.id + '" data-date="' + key + '">' +
              '<span class="cell-day">' + c.day + "</span>" +
              '<button type="button" class="shift-chip" style="background:' + esc(shift.color) + '" ' +
              'data-staff="' + p.id + '" data-date="' + key + '" title="' + esc(shift.name) + " " +
              esc(fmtRange(shift)) + '">' + esc(shift.name) + "</button></td>";
          } else {
            bodyHtml += '<td class="' + cls.join(" ") + '" data-staff="' + p.id + '" data-date="' + key + '"><span class="cell-day">' + c.day + "</span></td>";
          }
        });
        bodyHtml += "</tr>";
      });
    });
    els.calendarBody.innerHTML = bodyHtml;
  }

  function buildTeamRows() {
    var rows = [];
    state.teams.forEach(function (team) {
      var list = state.staff.filter(function (p) { return p.teamId === team.id; });
      if (list.length > 0) rows.push({ team: team, staffList: list });
    });
    var unassigned = state.staff.filter(function (p) {
      return !state.teams.some(function (t) { return t.id === p.teamId; });
    });
    if (unassigned.length > 0) rows.push({ team: null, staffList: unassigned });
    return rows;
  }

  function findShift(id) {
    for (var i = 0; i < state.shiftTypes.length; i++) {
      if (state.shiftTypes[i].id === id) return state.shiftTypes[i];
    }
    return null;
  }

  function findStaff(id) {
    for (var i = 0; i < state.staff.length; i++) {
      if (state.staff[i].id === id) return state.staff[i];
    }
    return null;
  }

  function findTeam(id) {
    for (var i = 0; i < state.teams.length; i++) {
      if (state.teams[i].id === id) return state.teams[i];
    }
    return null;
  }

  /* 迁移：将旧版个人级排班记录归并为班组级（同组取多数班次），未分组人员保留个人记录 */
  function migrateSchedule() {
    var changed = false;
    Object.keys(state.schedule).forEach(function (key) {
      var day = state.schedule[key];
      var votes = {}; // teamId -> { shiftId: count }
      state.staff.forEach(function (p) {
        if (p.teamId && day[p.id] != null) {
          if (!votes[p.teamId]) votes[p.teamId] = {};
          var sid = day[p.id];
          votes[p.teamId][sid] = (votes[p.teamId][sid] || 0) + 1;
          delete day[p.id];
          changed = true;
        }
      });
      Object.keys(votes).forEach(function (tid) {
        var best = null, bestN = 0;
        Object.keys(votes[tid]).forEach(function (sid) {
          if (votes[tid][sid] > bestN) { best = sid; bestN = votes[tid][sid]; }
        });
        day[tid] = best;
      });
      if (Object.keys(day).length === 0) delete state.schedule[key];
    });
    if (changed) save();
  }

  /* ===== 班次浮层 ===== */
  function openPopover(anchor, staffId, dateKeyStr) {
    closePopover();
    popover.open = true;
    popover.staffId = staffId;
    popover.dateKey = dateKeyStr;

    var staff = findStaff(staffId);
    var title = esc(staff ? staff.name : "") + " · " + esc(dateKeyStr);
    if (staff && staff.teamId) {
      var team = findTeam(staff.teamId);
      var cnt = state.staff.filter(function (p) { return p.teamId === staff.teamId; }).length;
      title = esc(team ? team.name : "班组") + "（" + cnt + " 人）· " + esc(dateKeyStr);
    }
    var html = '<div class="popover-title">' + title + "</div>";
    state.shiftTypes.forEach(function (s) {
      html += '<button type="button" class="popover-item" data-shift="' + s.id + '">' +
        '<span class="popover-swatch" style="background:' + esc(s.color) + '"></span>' +
        esc(s.name) + '<span class="popover-time">' + esc(fmtRange(s)) + "</span></button>";
    });
    html += '<div class="popover-divider"></div>';
    html += '<button type="button" class="popover-item clear" data-clear="1">清除排班</button>';
    els.shiftPopover.innerHTML = html;
    els.shiftPopover.classList.remove("hidden");

    var rect = anchor.getBoundingClientRect();
    var pw = els.shiftPopover.offsetWidth;
    var ph = els.shiftPopover.offsetHeight;
    var left = rect.left + rect.width / 2 - pw / 2;
    var top = rect.bottom + 6;
    if (left < 8) left = 8;
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if (top + ph > window.innerHeight - 8) top = rect.top - ph - 6;
    els.shiftPopover.style.left = left + "px";
    els.shiftPopover.style.top = top + "px";
  }

  function closePopover() {
    popover.open = false;
    popover.staffId = null;
    popover.dateKey = null;
    els.shiftPopover.classList.add("hidden");
    els.shiftPopover.innerHTML = "";
  }

  function setSchedule(staffId, dateKeyStr, shiftId) {
    var staff = findStaff(staffId);
    var unitId = staff && staff.teamId ? staff.teamId : staffId; // 同一班组共用同一套排班
    if (!state.schedule[dateKeyStr]) state.schedule[dateKeyStr] = {};
    if (shiftId) state.schedule[dateKeyStr][unitId] = shiftId;
    else delete state.schedule[dateKeyStr][unitId];
    // 清理该组成员的历史个人排班记录，保证组内统一
    if (staff && staff.teamId) {
      state.staff.forEach(function (p) {
        if (p.teamId === staff.teamId) delete state.schedule[dateKeyStr][p.id];
      });
    }
    if (Object.keys(state.schedule[dateKeyStr]).length === 0) delete state.schedule[dateKeyStr];
    save();
    renderCalendar();
  }

  /* 按班组轮班规则自动排满整月（从当月 1 号起循环） */
  function autoScheduleTeam(teamId, year, month) {
    var team = findTeam(teamId);
    if (!team || !team.rule || !team.rule.seq.length) return;
    var seq = team.rule.seq;
    var label = ruleLabel(team);
    if (!confirm("将按「" + label + "」循环，为「" + team.name + "」排满 " + year + " 年 " + (month + 1) + " 月，并覆盖该月现有排班。确定？")) return;
    var days = new Date(year, month + 1, 0).getDate();
    for (var d = 1; d <= days; d++) {
      var key = dateKey(year, month, d);
      if (!state.schedule[key]) state.schedule[key] = {};
      state.schedule[key][teamId] = seq[(d - 1) % seq.length];
      // 清理该组成员个人记录，保证整组一致
      state.staff.forEach(function (p) {
        if (p.teamId === teamId) delete state.schedule[key][p.id];
      });
    }
    save();
    renderCalendar();
  }

  /* ===== 弹窗 ===== */
  function openModal(opts) {
    var title = opts.title;
    els.modalTitle.textContent = title;
    els.modalFields.innerHTML = "";
    els.modalForm.dataset.kind = opts.kind;
    els.modalForm.dataset.id = opts.id || "";

    opts.fields.forEach(function (f) {
      var row = document.createElement("div");
      row.className = "form-row" + (f.inline ? "" : "");
      var label = document.createElement("label");
      label.textContent = f.label;
      label.setAttribute("for", "field-" + f.name);
      row.appendChild(label);

      var input;
      if (f.type === "select") {
        input = document.createElement("select");
        input.id = "field-" + f.name;
        f.options.forEach(function (o) {
          var opt = document.createElement("option");
          opt.value = o.value;
          opt.textContent = o.label;
          if (o.value === f.value) opt.selected = true;
          input.appendChild(opt);
        });
      } else if (f.type === "checkbox") {
        input = document.createElement("input");
        input.type = "checkbox";
        input.id = "field-" + f.name;
        if (f.value) input.checked = true;
      } else if (f.type === "seq") {
        row.classList.add("seq-field");
        var editor = document.createElement("div");
        editor.className = "seq-editor";
        editor.id = "field-" + f.name;
        var slots = document.createElement("div");
        slots.className = "seq-slots";
        editor.appendChild(slots);
        var addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "ghost-btn seq-add";
        addBtn.textContent = "添加班次";
        editor.appendChild(addBtn);
        row.appendChild(editor);
        els.modalFields.appendChild(row);
        bindSeqEditor(editor, f.options, f.value || []);
        return;
      } else {
        input = document.createElement("input");
        input.type = f.type === "time" ? "time" : (f.type === "color" ? "color" : "text");
        if (f.type === "time") { input.step = "1800"; }
        input.id = "field-" + f.name;
        input.value = f.value || "";
        input.placeholder = f.placeholder || "";
      }
      if (f.required) input.required = true;
      row.appendChild(input);
      els.modalFields.appendChild(row);
    });

    if (opts.inline) {
      // 开始/结束时间并排
      var rows = els.modalFields.querySelectorAll(".form-row");
      if (rows.length >= 3) {
        var startRow = rows[1];
        var endRow = rows[2];
        var wrap = document.createElement("div");
        wrap.className = "form-inline";
        startRow.parentNode.insertBefore(wrap, startRow);
        wrap.appendChild(startRow);
        wrap.appendChild(endRow);
      }
    }

    els.modalMask.classList.remove("hidden");
    var firstInput = els.modalFields.querySelector("input, select");
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    els.modalMask.classList.add("hidden");
    els.modalFields.innerHTML = "";
  }

  /* 轮班规则序列编辑器：多行下拉（班次选择），可增删行 */
  function bindSeqEditor(editor, options, seqVal) {
    var slots = editor.querySelector(".seq-slots");

    function makeRow(selVal) {
      var row = document.createElement("div");
      row.className = "seq-slot-row";
      var idx = document.createElement("span");
      idx.className = "seq-idx";
      var sel = document.createElement("select");
      var opt0 = document.createElement("option");
      opt0.value = "";
      opt0.textContent = "无";
      sel.appendChild(opt0);
      options.forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.label;
        if (o.value === selVal) opt.selected = true;
        sel.appendChild(opt);
      });
      var up = document.createElement("button");
      up.type = "button";
      up.className = "seq-move-btn seq-up";
      up.title = "上移（调整第几天）";
      up.setAttribute("aria-label", "上移");
      up.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var down = document.createElement("button");
      down.type = "button";
      down.className = "seq-move-btn seq-down";
      down.title = "下移（调整第几天）";
      down.setAttribute("aria-label", "下移");
      down.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn seq-del";
      del.title = "移除该班次";
      del.setAttribute("aria-label", "移除该班次");
      del.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      row.appendChild(idx);
      row.appendChild(sel);
      row.appendChild(up);
      row.appendChild(down);
      row.appendChild(del);
      return row;
    }

    function refreshIdx() {
      Array.prototype.forEach.call(slots.querySelectorAll(".seq-idx"), function (el, i) {
        el.textContent = ordinalCn(i) + "：";
      });
    }

    (seqVal.length ? seqVal : [""]).forEach(function (v) { slots.appendChild(makeRow(v)); });
    refreshIdx();

    editor.querySelector(".seq-add").addEventListener("click", function () {
      slots.appendChild(makeRow(""));
      refreshIdx();
    });
    slots.addEventListener("click", function (e) {
      var upBtn = e.target.closest(".seq-up");
      if (upBtn) {
        var row = upBtn.closest(".seq-slot-row");
        var prev = row.previousElementSibling;
        if (prev) { slots.insertBefore(row, prev); refreshIdx(); }
        return;
      }
      var downBtn = e.target.closest(".seq-down");
      if (downBtn) {
        var row = downBtn.closest(".seq-slot-row");
        var next = row.nextElementSibling;
        if (next) { slots.insertBefore(next, row); refreshIdx(); }
        return;
      }
      var delBtn = e.target.closest(".seq-del");
      if (!delBtn) return;
      var row = delBtn.closest(".seq-slot-row");
      if (slots.children.length <= 1) { row.querySelector("select").value = ""; return; }
      row.remove();
      refreshIdx();
    });
  }

  function readSeq(name) {
    var container = byId("field-" + name);
    if (!container) return [];
    var arr = [];
    container.querySelectorAll("select").forEach(function (sel) {
      if (sel.value) arr.push(sel.value);
    });
    return arr;
  }

  function readField(name) {
    var el = byId("field-" + name);
    if (!el) return "";
    if (el.type === "checkbox") return el.checked ? "on" : "";
    return el.value;
  }

  /* ===== 排班模式 CRUD ===== */
  function renderShifts() {
    if (state.shiftTypes.length === 0) {
      els.shiftList.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">' +
        '<rect x="4" y="6" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        '<path d="M8 3v5M16 3v5M4 11h16" stroke="currentColor" stroke-width="1.6"/></svg>' +
        "<p>还没有排班模式，点击右上角添加。</p></div>";
      return;
    }
    var html = "";
    state.shiftTypes.forEach(function (s) {
      html += '<div class="card">' +
        '<div class="card-top"><span class="card-swatch" style="background:' + esc(s.color) + '"></span>' +
        '<span class="card-title">' + esc(s.name) + "</span></div>" +
        '<div class="card-time"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
        '<path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        esc(fmtRange(s)) + "</div>" +
        '<div class="card-actions">' +
        '<button type="button" class="ghost-btn" data-edit-shift="' + s.id + '">编辑</button>' +
        '<button type="button" class="danger-text-btn" data-del-shift="' + s.id + '">删除</button>' +
        "</div></div>";
    });
    els.shiftList.innerHTML = html;
  }

  function openShiftForm(shift) {
    openModal({
      title: shift ? "编辑排班模式" : "添加排班模式",
      kind: "shift",
      id: shift ? shift.id : "",
      inline: true,
      fields: [
        { name: "name", label: "班次名称", type: "text", value: shift ? shift.name : "", required: true, placeholder: "如：白班" },
        { name: "start", label: "开始时间", type: "time", value: shift ? shift.start : "08:00" },
        { name: "end", label: "结束时间", type: "time", value: shift ? shift.end : "16:00" },
        { name: "color", label: "颜色", type: "color", value: shift ? shift.color : "#2563eb" }
      ]
    });
  }

  function submitShift(id) {
    var name = readField("name").trim();
    if (!name) { alert("请填写班次名称"); return false; }
    var color = readField("color") || "#2563eb";
    var start = readField("start");
    var end = readField("end");
    if (id) {
      var s = findShift(id);
      if (s) { s.name = name; s.color = color; s.start = start; s.end = end; }
    } else {
      state.shiftTypes.push({ id: uid(), name: name, color: color, start: start, end: end });
    }
    save();
    renderAll();
    return true;
  }

  function deleteShift(id) {
    if (!confirm("删除该排班模式后，日历上使用它的排班记录也会一并清除。确定删除？")) return;
    state.shiftTypes = state.shiftTypes.filter(function (s) { return s.id !== id; });
    // 清理排班引用
    Object.keys(state.schedule).forEach(function (key) {
      var day = state.schedule[key];
      Object.keys(day).forEach(function (sid) {
        if (day[sid] === id) delete day[sid];
      });
      if (Object.keys(day).length === 0) delete state.schedule[key];
    });
    // 清理班组轮班规则中的引用
    state.teams.forEach(function (t) {
      if (t.rule && t.rule.seq) {
        t.rule.seq = t.rule.seq.filter(function (sid) { return sid !== id; });
        if (t.rule.seq.length === 0) t.rule = null;
      }
    });
    save();
    renderAll();
  }

  /* ===== 班组 CRUD ===== */
  function renderTeams() {
    if (state.teams.length === 0) {
      els.teamList.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">' +
        '<circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        '<circle cx="17" cy="10" r="2.2" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        '<path d="M3.5 19c.6-3 3-4.5 5.5-4.5s4.9 1.5 5.5 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M14.5 14.8c2.2.4 3.7 1.8 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
        "<p>还没有班组，点击右上角添加。</p></div>";
      return;
    }
    var html = "";
    state.teams.forEach(function (team) {
      var members = state.staff.filter(function (p) { return p.teamId === team.id; });
      var tags = members.length
        ? '<div class="team-members-tags">' + members.slice(0, 6).map(function (m) {
            return '<span class="member-tag">' + esc(m.name) + "</span>";
          }).join("") + (members.length > 6 ? '<span class="member-tag">+' + (members.length - 6) + "</span>" : "") + "</div>"
        : '<div class="card-meta">暂无成员</div>';
      var ruleHtml = "";
      if (team.rule && team.rule.seq.length) {
        ruleHtml = '<div class="card-meta rule-preview" title="' + esc(ruleLabel(team)) + '">规则：' + esc(ruleLabel(team)) + "</div>";
      }
      html += '<div class="card">' +
        '<div class="card-top"><span class="card-title">' + esc(team.name) + "</span>" +
        '<span class="team-count"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
        '<circle cx="9" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/>' +
        '<path d="M3.5 19c.6-3 3-4.5 5.5-4.5s4.9 1.5 5.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
        '<path d="M14.5 14.8c2.2.4 3.7 1.8 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
        members.length + " 人</span></div>" +
        tags +
        ruleHtml +
        '<div class="card-actions">' +
        '<button type="button" class="ghost-btn" data-edit-team="' + team.id + '">编辑</button>' +
        '<button type="button" class="danger-text-btn" data-del-team="' + team.id + '">删除</button>' +
        "</div></div>";
    });
    els.teamList.innerHTML = html;
  }

  function openTeamForm(team) {
    var shiftOptions = state.shiftTypes.map(function (s) { return { value: s.id, label: s.name }; });
    openModal({
      title: team ? "编辑班组" : "添加班组",
      kind: "team",
      id: team ? team.id : "",
      fields: [
        { name: "name", label: "班组名称", type: "text", value: team ? team.name : "", required: true, placeholder: "如：一班" },
        { name: "ruleOn", label: "启用轮班规则（排班时按下方序列循环）", type: "checkbox", value: team && team.rule ? true : false },
        { name: "ruleSeq", label: "轮班规则（第1天、第2天…依次循环）", type: "seq", value: team && team.rule ? team.rule.seq : [], options: shiftOptions }
      ]
    });
  }

  function submitTeam(id) {
    var name = readField("name").trim();
    if (!name) { alert("请填写班组名称"); return false; }
    var ruleOn = readField("ruleOn") === "on";
    var seq = readSeq("ruleSeq");
    if (ruleOn && seq.length === 0) { alert("请至少选择一个班次组成轮班规则"); return false; }
    var rule = ruleOn ? { seq: seq } : null;
    if (id) {
      var team = state.teams.find(function (t) { return t.id === id; });
      if (team) { team.name = name; team.rule = rule; }
    } else {
      state.teams.push({ id: uid(), name: name, rule: rule });
    }
    save();
    renderAll();
    return true;
  }

  function deleteTeam(id) {
    if (!confirm("删除该班组后，组内人员会移到「未分组」，原班组排班将转为个人排班保留。确定删除？")) return;
    var teamStaff = state.staff.filter(function (p) { return p.teamId === id; });
    // 班组排班转为成员个人排班，避免排班丢失
    Object.keys(state.schedule).forEach(function (key) {
      var day = state.schedule[key];
      if (day[id] != null) {
        teamStaff.forEach(function (p) { day[p.id] = day[id]; });
        delete day[id];
      }
      if (Object.keys(day).length === 0) delete state.schedule[key];
    });
    state.teams = state.teams.filter(function (t) { return t.id !== id; });
    state.staff.forEach(function (p) { if (p.teamId === id) p.teamId = ""; });
    save();
    renderAll();
  }

  /* ===== 人员 CRUD ===== */
  function renderStaff() {
    if (state.staff.length === 0) {
      els.staffList.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">' +
        '<circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
        '<path d="M5.5 19c.8-3.2 3.3-5 6.5-5s5.7 1.8 6.5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
        "<p>还没有人员，点击右上角添加。</p></div>";
      return;
    }
    var html = '<table class="staff-table"><thead><tr>' +
      "<th>姓名</th><th>班组</th><th>联系电话</th><th>备注</th><th style=\"width:120px\">操作</th>" +
      "</tr></thead><tbody>";
    state.staff.forEach(function (p) {
      var team = state.teams.find(function (t) { return t.id === p.teamId; });
      html += "<tr>" +
        '<td class="staff-name">' + esc(p.name) + "</td>" +
        '<td>' + (team ? '<span class="team-badge">' + esc(team.name) + "</span>" : '<span class="team-badge none">未分组</span>') + "</td>" +
        '<td class="staff-note">' + esc(p.phone || "—") + "</td>" +
        '<td class="staff-note">' + esc(p.note || "—") + "</td>" +
        '<td><button type="button" class="ghost-btn" data-edit-staff="' + p.id + '">编辑</button> ' +
        '<button type="button" class="danger-text-btn" data-del-staff="' + p.id + '">删除</button></td>' +
        "</tr>";
    });
    html += "</tbody></table>";
    els.staffList.innerHTML = html;
  }

  function openStaffForm(staff) {
    var teamOptions = [{ value: "", label: "未分组" }].concat(
      state.teams.map(function (t) { return { value: t.id, label: t.name }; })
    );
    openModal({
      title: staff ? "编辑人员" : "添加人员",
      kind: "staff",
      id: staff ? staff.id : "",
      fields: [
        { name: "name", label: "姓名", type: "text", value: staff ? staff.name : "", required: true, placeholder: "如：张伟" },
        { name: "teamId", label: "所属班组", type: "select", value: staff ? staff.teamId : "", options: teamOptions },
        { name: "phone", label: "联系电话", type: "text", value: staff ? staff.phone : "", placeholder: "选填" },
        { name: "note", label: "备注", type: "text", value: staff ? staff.note : "", placeholder: "选填" }
      ]
    });
  }

  function submitStaff(id) {
    var name = readField("name").trim();
    if (!name) { alert("请填写姓名"); return false; }
    var teamId = readField("teamId");
    var phone = readField("phone").trim();
    var note = readField("note").trim();
    if (id) {
      var p = state.staff.find(function (x) { return x.id === id; });
      if (p) { p.name = name; p.teamId = teamId; p.phone = phone; p.note = note; }
    } else {
      state.staff.push({ id: uid(), name: name, teamId: teamId, phone: phone, note: note });
    }
    save();
    renderAll();
    return true;
  }

  function deleteStaff(id) {
    if (!confirm("删除该人员后，其排班记录也会一并清除。确定删除？")) return;
    state.staff = state.staff.filter(function (p) { return p.id !== id; });
    Object.keys(state.schedule).forEach(function (key) {
      delete state.schedule[key][id];
      if (Object.keys(state.schedule[key]).length === 0) delete state.schedule[key];
    });
    save();
    renderAll();
  }

  /* ===== 数据导出 ===== */
  function csvEscape(v) {
    v = String(v == null ? "" : v);
    if (/[",\r\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  /* 构建当前月排班表 CSV（班组 × 人员 × 日期） */
  function buildMonthCsv() {
    var cells = buildMonthCells(state.year, state.month);
    var lines = [];
    var header = ["班组", "人员"];
    cells.forEach(function (c) { header.push((c.month + 1) + "/" + c.day); });
    lines.push(header.map(csvEscape).join(","));
    var teamRows = buildTeamRows();
    teamRows.forEach(function (g) {
      var groupName = g.team ? g.team.name : "未分组";
      g.staffList.forEach(function (p) {
        var row = [groupName, p.name];
        cells.forEach(function (c) {
          var key = dateKey(c.year, c.month, c.day);
          var daySch = c.inMonth ? state.schedule[key] : null;
          var shiftId = null;
          if (daySch) {
            var unitId = p.teamId || p.id;
            shiftId = daySch[unitId] || null;
            if (!shiftId && p.teamId) shiftId = daySch[p.id] || null;
          }
          var s = shiftId ? findShift(shiftId) : null;
          row.push(s ? s.name : "");
        });
        lines.push(row.map(csvEscape).join(","));
      });
    });
    return lines.join("\r\n");
  }

  function downloadFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function exportMonthCsv() {
    var csv = "\uFEFF" + buildMonthCsv(); // BOM 前缀，保证 Excel 正确识别中文
    downloadFile("排班表_" + state.year + "-" + pad(state.month + 1) + ".csv", csv, "text/csv;charset=utf-8");
  }

  function exportDataJson() {
    var data = JSON.stringify({
      shiftTypes: state.shiftTypes,
      teams: state.teams,
      staff: state.staff,
      schedule: state.schedule
    }, null, 2);
    var t = today();
    downloadFile("排班数据备份_" + t.year + "-" + pad(t.month + 1) + "-" + pad(t.day) + ".json", data, "application/json");
  }

  /* ===== 全量渲染 ===== */
  function renderAll() {
    renderCalendar();
    renderShifts();
    renderTeams();
    renderStaff();
  }

  /* ===== 事件绑定 ===== */
  function bindEvents() {
    // 视图切换
    window.addEventListener("hashchange", function () {
      renderView(currentView());
    });

    // 月份切换
    els.btnPrev.addEventListener("click", function () {
      state.month--;
      if (state.month < 0) { state.month = 11; state.year--; }
      renderCalendar();
    });
    els.btnNext.addEventListener("click", function () {
      state.month++;
      if (state.month > 11) { state.month = 0; state.year++; }
      renderCalendar();
    });
    els.btnToday.addEventListener("click", function () {
      var t = today();
      state.year = t.year;
      state.month = t.month;
      renderCalendar();
    });

    // 导出
    els.btnExport.addEventListener("click", function (e) {
      e.stopPropagation();
      var hidden = els.exportMenu.classList.toggle("hidden");
      els.btnExport.setAttribute("aria-expanded", hidden ? "false" : "true");
    });
    els.exportMenu.addEventListener("click", function (e) {
      var item = e.target.closest("[data-export]");
      if (!item) return;
      var type = item.dataset.export;
      if (type === "csv") exportMonthCsv();
      if (type === "json") exportDataJson();
      els.exportMenu.classList.add("hidden");
      els.btnExport.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".export-box")) {
        els.exportMenu.classList.add("hidden");
        els.btnExport.setAttribute("aria-expanded", "false");
      }
    });

    // 添加按钮
    els.btnAddShift.addEventListener("click", function () { openShiftForm(null); });
    els.btnAddTeam.addEventListener("click", function () { openTeamForm(null); });
    els.btnAddStaff.addEventListener("click", function () { openStaffForm(null); });

    // 日历点击（事件委托）
    els.calendarBody.addEventListener("click", function (e) {
      var autoBtn = e.target.closest("[data-auto-team]");
      if (autoBtn) {
        autoScheduleTeam(autoBtn.dataset.autoTeam, state.year, state.month);
        return;
      }
      var cell = e.target.closest("td[data-staff], button.shift-chip");
      if (cell) {
        openPopover(cell, cell.dataset.staff, cell.dataset.date);
        return;
      }
      var nav = e.target.closest("td[data-nav]");
      if (nav) {
        var parts = nav.dataset.nav.split("-");
        state.year = parseInt(parts[0], 10);
        state.month = parseInt(parts[1], 10) - 1;
        renderCalendar();
      }
    });

    // 浮层操作
    els.shiftPopover.addEventListener("click", function (e) {
      var shiftItem = e.target.closest("[data-shift]");
      if (shiftItem) {
        setSchedule(popover.staffId, popover.dateKey, shiftItem.dataset.shift);
        closePopover();
        return;
      }
      var clearItem = e.target.closest("[data-clear]");
      if (clearItem) {
        setSchedule(popover.staffId, popover.dateKey, null);
        closePopover();
      }
    });

    // 点击外部关闭浮层
    document.addEventListener("click", function (e) {
      if (popover.open && !e.target.closest("#shift-popover") && !e.target.closest(".calendar td[data-staff], .calendar button.shift-chip")) {
        closePopover();
      }
    });

    // 列表卡片操作（事件委托）
    document.querySelector(".main").addEventListener("click", function (e) {
      var editShift = e.target.closest("[data-edit-shift]");
      if (editShift) { openShiftForm(findShift(editShift.dataset.editShift)); return; }
      var delShift = e.target.closest("[data-del-shift]");
      if (delShift) { deleteShift(delShift.dataset.delShift); return; }

      var editTeam = e.target.closest("[data-edit-team]");
      if (editTeam) {
        var team = state.teams.find(function (t) { return t.id === editTeam.dataset.editTeam; });
        if (team) openTeamForm(team);
        return;
      }
      var delTeam = e.target.closest("[data-del-team]");
      if (delTeam) { deleteTeam(delTeam.dataset.delTeam); return; }

      var editStaff = e.target.closest("[data-edit-staff]");
      if (editStaff) {
        var staff = state.staff.find(function (p) { return p.id === editStaff.dataset.editStaff; });
        if (staff) openStaffForm(staff);
        return;
      }
      var delStaff = e.target.closest("[data-del-staff]");
      if (delStaff) { deleteStaff(delStaff.dataset.delStaff); return; }
    });

    // 弹窗
    els.modalClose.addEventListener("click", closeModal);
    els.modalCancel.addEventListener("click", closeModal);
    els.modalMask.addEventListener("click", function (e) {
      if (e.target === els.modalMask) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); closePopover(); }
    });
    els.modalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var kind = els.modalForm.dataset.kind;
      var id = els.modalForm.dataset.id;
      var ok = false;
      if (kind === "shift") ok = submitShift(id);
      if (kind === "team") ok = submitTeam(id);
      if (kind === "staff") ok = submitStaff(id);
      if (ok) closeModal();
    });
  }

  /* ===== 初始化 ===== */
  function init() {
    els.monthLabel = byId("month-label");
    els.btnPrev = byId("btn-prev");
    els.btnNext = byId("btn-next");
    els.btnToday = byId("btn-today");
    els.legend = byId("legend");
    els.calendarEmpty = byId("calendar-empty");
    els.calendarWrap = byId("calendar-wrap");
    els.calendarHead = byId("calendar-head");
    els.calendarBody = byId("calendar-body");
    els.shiftList = byId("shift-list");
    els.teamList = byId("team-list");
    els.staffList = byId("staff-list");
    els.btnAddShift = byId("btn-add-shift");
    els.btnAddTeam = byId("btn-add-team");
    els.btnAddStaff = byId("btn-add-staff");
    els.modalMask = byId("modal-mask");
    els.modalTitle = byId("modal-title");
    els.modalFields = byId("modal-fields");
    els.modalForm = byId("modal-form");
    els.modalClose = byId("modal-close");
    els.modalCancel = byId("modal-cancel");
    els.shiftPopover = byId("shift-popover");
    els.btnExport = byId("btn-export");
    els.exportMenu = byId("export-menu");

    load();
    var t = today();
    state.year = t.year;
    state.month = t.month;
    bindEvents();
    renderView(currentView());
  }

  document.addEventListener("DOMContentLoaded", init);
})();
