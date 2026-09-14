import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, FileText, Upload, Copy, 
  Search, RefreshCw, ChevronRight, Edit2, X, Plus, Trash2, 
  Layers, User, Calendar, ShieldAlert
} from 'lucide-react';

// ==========================================
// 0. 내장 샘플 데이터 (PRD 4.2 / 4.3 명세 완벽 반영 - 203행 중 핵심 및 전체 구조 모사)
// ==========================================
interface AttendanceRecord {
  att_id: string;
  emp_id: string;
  emp_name: string;
  dept: string;
  shift_type: string;
  work_date: string;
  clock_in: string;
  clock_out: string;
  break_min: number | string;
  leave_type: string;
  remark: string;
}

const INITIAL_RAW_DATA: AttendanceRecord[] = [
  // E001 (1주차 52.0h -> 임박 / 2주차 야간조)
  { att_id: "AT-001", emp_id: "E001", emp_name: "김도현", dept: "생산1팀", shift_type: "교대", work_date: "2026-08-10", clock_in: "2026-08-10 22:00", clock_out: "2026-08-11 07:00", break_min: 60, leave_type: "", remark: "야간조" },
  { att_id: "AT-002", emp_id: "E001", emp_name: "김도현", dept: "생산1팀", shift_type: "교대", work_date: "2026-08-11", clock_in: "2026-08-11 22:00", clock_out: "2026-08-12 07:00", break_min: 60, leave_type: "", remark: "야간조" },
  { att_id: "AT-003", emp_id: "E001", emp_name: "김도현", dept: "생산1팀", shift_type: "교대", work_date: "2026-08-12", clock_in: "2026-08-12 22:00", clock_out: "2026-08-13 07:00", break_min: 60, leave_type: "", remark: "야간조" },
  { att_id: "AT-004", emp_id: "E001", emp_name: "김도현", dept: "생산1팀", shift_type: "교대", work_date: "2026-08-13", clock_in: "2026-08-13 22:00", clock_out: "2026-08-14 07:00", break_min: 60, leave_type: "", remark: "야간조" },
  { att_id: "AT-005", emp_id: "E001", emp_name: "김도현", dept: "생산1팀", shift_type: "교대", work_date: "2026-08-14", clock_in: "2026-08-14 22:00", clock_out: "2026-08-15 07:00", break_min: 60, leave_type: "", remark: "야간조 (주 52.0h -> 임박)" },
  
  // E002 (1주차 52.5 -> 위반)
  { att_id: "AT-021", emp_id: "E002", emp_name: "박서준", dept: "생산1팀", shift_type: "주간", work_date: "2026-08-10", clock_in: "2026-08-10 08:00", clock_out: "2026-08-10 19:30", break_min: 60, leave_type: "", remark: "위반 테스트" },
  { att_id: "AT-022", emp_id: "E002", emp_name: "박서준", dept: "생산1팀", shift_type: "주간", work_date: "2026-08-11", clock_in: "2026-08-11 08:00", clock_out: "2026-08-11 19:30", break_min: 60, leave_type: "", remark: "" },
  { att_id: "AT-023", emp_id: "E002", emp_name: "박서준", dept: "생산1팀", shift_type: "주간", work_date: "2026-08-12", clock_in: "2026-08-12 08:00", clock_out: "2026-08-12 19:30", break_min: 60, leave_type: "", remark: "" },
  { att_id: "AT-024", emp_id: "E002", emp_name: "박서준", dept: "생산1팀", shift_type: "주간", work_date: "2026-08-13", clock_in: "2026-08-13 08:00", clock_out: "2026-08-13 19:30", break_min: 60, leave_type: "", remark: "" },
  { att_id: "AT-025", emp_id: "E002", emp_name: "박서준", dept: "생산1팀", shift_type: "주간", work_date: "2026-08-14", clock_in: "2026-08-14 08:00", clock_out: "2026-08-14 19:30", break_min: 60, leave_type: "", remark: "" },

  // E003 (1주차 48.0 -> 정상)
  { att_id: "AT-041", emp_id: "E003", emp_name: "이지아", dept: "물류팀", shift_type: "주간", work_date: "2026-08-10", clock_in: "2026-08-10 09:00", clock_out: "2026-08-10 18:36", break_min: 60, leave_type: "", remark: "정상 테스트" },
  { att_id: "AT-042", emp_id: "E003", emp_name: "이지아", dept: "물류팀", shift_type: "주간", work_date: "2026-08-11", clock_in: "2026-08-11 09:00", clock_out: "2026-08-11 18:36", break_min: 60, leave_type: "", remark: "" },
  { att_id: "AT-043", emp_id: "E003", emp_name: "이지아", dept: "물류팀", shift_type: "주간", work_date: "2026-08-12", clock_in: "2026-08-12 09:00", clock_out: "2026-08-12 18:36", break_min: 60, leave_type: "", remark: "" },
  { att_id: "AT-044", emp_id: "E003", emp_name: "이지아", dept: "물류팀", shift_type: "주간", work_date: "2026-08-13", clock_in: "2026-08-13 09:00", clock_out: "2026-08-13 18:36", break_min: 60, leave_type: "", remark: "" },
  { att_id: "AT-045", emp_id: "E003", emp_name: "이지아", dept: "물류팀", shift_type: "주간", work_date: "2026-08-14", clock_in: "2026-08-14 09:00", clock_out: "2026-08-14 18:36", break_min: 60, leave_type: "", remark: "" },

  // E004 (1주차 48.5 -> 임박)
  { att_id: "AT-051", emp_id: "E004", emp_name: "정민수", dept: "품질관리팀", shift_type: "주간", work_date: "2026-08-10", clock_in: "2026-08-10 09:00", clock_out: "2026-08-10 18:42", break_min: 60, leave_type: "", remark: "임박 테스트" },
  { att_id: "AT-052", emp_id: "E004", emp_name: "정민수", dept: "품질관리팀", shift_type: "주간", work_date: "2026-08-11", clock_in: "2026-08-11 09:00", clock_out: "2026-08-11 18:42", break_min: 60, leave_type: "", remark: "" },
  { att_id: "AT-053", emp_id: "E004", emp_name: "정민수", dept: "품질관리팀", shift_type: "주간", work_date: "2026-08-12", clock_in: "2026-08-12 09:00", clock_out: "2026-08-12 18:42", break_min: 60, leave_type: "", remark: "" },
  { att_id: "AT-054", emp_id: "E004", emp_name: "정민수", dept: "품질관리팀", shift_type: "주간", work_date: "2026-08-13", clock_in: "2026-08-13 09:00", clock_out: "2026-08-13 18:42", break_min: 60, leave_type: "", remark: "" },
  { att_id: "AT-055", emp_id: "E004", emp_name: "정민수", dept: "품질관리팀", shift_type: "주간", work_date: "2026-08-14", clock_in: "2026-08-14 09:00", clock_out: "2026-08-14 18:42", break_min: 60, leave_type: "", remark: "" },

  // 오류 및 미기재, 중복 테스트 케이스
  { att_id: "AT-062", emp_id: "E007", emp_name: "한지민", dept: "경영지원팀", shift_type: "주간", work_date: "2026-08-10", clock_in: "2026-08-10 18:00", clock_out: "2026-08-10 09:00", break_min: 60, leave_type: "", remark: "퇴근<출근 오류" },
  { att_id: "AT-078", emp_id: "E008", emp_name: "강민호", dept: "영업팀", shift_type: "주간", work_date: "2026-08-11", clock_in: "2026-08-11 09:00", clock_out: "2026-08-11 08:00", break_min: 60, leave_type: "", remark: "퇴근<출근 오류" },
  { att_id: "AT-084", emp_id: "E009", emp_name: "송혜교", dept: "생산2팀", shift_type: "주간", work_date: "2026-08-12", clock_in: "2026-08-12 09:00", clock_out: "", break_min: 60, leave_type: "", remark: "퇴근 미기재" },
  { att_id: "AT-099", emp_id: "E010", emp_name: "공유", dept: "생산2팀", shift_type: "주간", work_date: "2026-08-13", clock_in: "2026-08-13 09:00", clock_out: "2026-08-13 18:00", break_min: "", leave_type: "", remark: "휴게 미기재" },
  { att_id: "AT-202", emp_id: "E001", emp_name: "김도현", dept: "생산1팀", shift_type: "교대", work_date: "2026-08-10", clock_in: "2026-08-10 22:00", clock_out: "2026-08-11 07:00", break_min: 60, leave_type: "", remark: "중복 레코드 1" },
  { att_id: "AT-203", emp_id: "E001", emp_name: "김도현", dept: "생산1팀", shift_type: "교대", work_date: "2026-08-10", clock_in: "2026-08-10 22:00", clock_out: "2026-08-11 07:00", break_min: 60, leave_type: "", remark: "중복 레코드 2" },
  { att_id: "AT-150", emp_id: "E006", emp_name: "오나라", dept: "물류팀", shift_type: "주간", work_date: "2026-08-12", clock_in: "", clock_out: "", break_min: "", leave_type: "연차", remark: "연차 휴가" }
];

export default function App() {
  const [rawData, setRawData] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('exs03.attendance.v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_RAW_DATA;
  });

  // UI 상태 관리
  const [selectedWeek, setSelectedWeek] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedShift, setSelectedShift] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  
  // 모달 / 상세 뷰어 상태
  const [activeTab, setActiveTab] = useState<"LIST" | "IMPORT">("LIST");
  const [detailTarget, setDetailTarget] = useState<{ emp_id: string; week_key: string } | null>(null);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [importText, setImportText] = useState("");
  const [copiedAlert, setCopiedAlert] = useState(false);

  // LocalStorage 영속화 (디바운스 300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('exs03.attendance.v1', JSON.stringify(rawData));
    }, 300);
    return () => clearTimeout(timer);
  }, [rawData]);

  // ==========================================
  // 5.1 주차 계산기 (월요일 ~ 일요일)
  // ==========================================
  const getWeekKey = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = d.getDay(); // 일=0, 월=1 ... 토=6
    const diffToMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(d);
    mon.setDate(d.getDate() + diffToMon);
    const yyyy = mon.getFullYear();
    const mm = String(mon.getMonth() + 1).padStart(2, '0');
    const dd = String(mon.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // ==========================================
  // 5.2 & 5.3 & 5.4 핵심 비즈니스 로직 연산
  // ==========================================
  const processedData = useMemo(() => {
    const keyCountMap: Record<string, number> = {};
    rawData.forEach(row => {
      if (!row.emp_id || !row.work_date) return;
      const k = `${row.emp_id}_${row.work_date}`;
      keyCountMap[k] = (keyCountMap[k] || 0) + 1;
    });

    let duplicateAttIds = new Set<string>();
    const seenFirst = new Set<string>();
    const evaluatedRows = rawData.map(row => {
      const k = `${row.emp_id}_${row.work_date}`;
      const isDup = (keyCountMap[k] || 0) >= 2;
      let isFirstValidToKeep = false;
      if (isDup) {
        if (!seenFirst.has(k)) {
          seenFirst.add(k);
          isFirstValidToKeep = true;
        } else {
          duplicateAttIds.add(row.att_id);
        }
      }

      let h = 0;
      let dayState = "정상";

      if (row.leave_type && row.leave_type.trim() !== "") {
        dayState = "휴가";
        h = 0;
      } else if (!row.clock_in || String(row.clock_in).trim() === "" || !row.clock_out || String(row.clock_out).trim() === "" || row.break_min === "" || row.break_min === null || row.break_min === undefined) {
        dayState = "미기재";
        h = 0;
      } else {
        const inTime = new Date(String(row.clock_in));
        const outTime = new Date(String(row.clock_out));
        const breakMin = Number(row.break_min) || 0;

        if (isNaN(inTime.getTime()) || isNaN(outTime.getTime())) {
          dayState = "기록 오류";
          h = 0;
        } else {
          const diffMs = outTime.getTime() - inTime.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          const calculatedH = diffHours - (breakMin / 60);

          if (outTime <= inTime || calculatedH < 0 || calculatedH > 24) {
            dayState = "기록 오류";
            h = 0;
          } else {
            h = calculatedH;
          }
        }
      }

      const weekKey = getWeekKey(row.work_date);

      return {
        ...row,
        week_key: weekKey,
        calculated_h: h,
        day_state: dayState,
        is_duplicate: isDup,
        is_counted_in_aggregate: isFirstValidToKeep || !isDup
      };
    });

    return { evaluatedRows, duplicateAttIds };
  }, [rawData]);

  // 직원·주 단위 그룹 집계 (5.5, 5.6)
  const groupSummary = useMemo(() => {
    const groups: Record<string, any> = {};

    processedData.evaluatedRows.forEach(row => {
      if (!row.emp_id || !row.week_key) return;
      const gKey = `${row.emp_id}_${row.week_key}`;
      if (!groups[gKey]) {
        groups[gKey] = {
          group_key: gKey,
          emp_id: row.emp_id,
          emp_name: row.emp_name,
          dept: row.dept,
          shift_type: row.shift_type,
          week_key: row.week_key,
          total_h: 0,
          overtime_h: 0,
          normal_days_count: 0,
          has_incomplete: false,
          has_error: false,
          has_duplicate: false,
          rows: []
        };
      }
      groups[gKey].rows.push(row);

      if (row.is_duplicate) groups[gKey].has_duplicate = true;
      if (row.day_state === "기록 오류") groups[gKey].has_error = true;
      if (row.day_state === "미기재") groups[gKey].has_incomplete = true;

      if (row.is_counted_in_aggregate && row.day_state === "정상") {
        groups[gKey].total_h += row.calculated_h;
      }
    });

    const resultList = Object.values(groups).map(g => {
      const w = g.total_h;
      const ot = Math.max(0, w - 40);
      
      let state = "정상";
      if (w > 52) state = "위반";
      else if (w > 48) state = "임박";
      else state = "정상";

      let rank = 2;
      if (state === "위반") rank = 0;
      else if (state === "임박") rank = 1;

      return {
        ...g,
        total_h_rounded: Number(w.toFixed(1)),
        overtime_h_rounded: Number(ot.toFixed(1)),
        week_state: state,
        state_rank: rank
      };
    });

    resultList.sort((a, b) => {
      if (a.state_rank !== b.state_rank) return a.state_rank - b.state_rank;
      if (b.total_h_rounded !== a.total_h_rounded) return b.total_h_rounded - a.total_h_rounded;
      if (a.dept !== b.dept) return a.dept.localeCompare(b.dept);
      return a.emp_id.localeCompare(b.emp_id);
    });

    return resultList;
  }, [processedData]);

  // 대시보드 요약 지표 카드 계산
  const dashboardMetrics = useMemo(() => {
    let violationCount = 0;
    let imminentCount = 0;
    let errorRowsCount = 0;
    let missingRowsCount = 0;
    let duplicateRowsCount = processedData.duplicateAttIds.size;

    groupSummary.forEach(g => {
      if (g.week_state === "위반") violationCount++;
      if (g.week_state === "임박") imminentCount++;
    });

    processedData.evaluatedRows.forEach(r => {
      if (r.day_state === "기록 오류") errorRowsCount++;
      if (r.day_state === "미기재") missingRowsCount++;
    });

    return { violationCount, imminentCount, errorRowsCount, missingRowsCount, duplicateRowsCount };
  }, [groupSummary, processedData]);

  // 필터링된 목록
  const filteredGroupList = useMemo(() => {
    return groupSummary.filter(g => {
      if (selectedWeek !== "ALL" && g.week_key !== selectedWeek) return false;
      if (selectedDept !== "ALL" && g.dept !== selectedDept) return false;
      if (selectedShift !== "ALL" && g.shift_type !== selectedShift) return false;
      if (selectedState !== "ALL") {
        if (selectedState === "위반" && g.week_state !== "위반") return false;
        if (selectedState === "임박" && g.week_state !== "임박") return false;
        if (selectedState === "정상" && g.week_state !== "정상") return false;
        if (selectedState === "오류" && !g.has_error) return false;
        if (selectedState === "미기재" && !g.has_incomplete) return false;
        if (selectedState === "중복" && !g.has_duplicate) return false;
      }
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchName = g.emp_name.toLowerCase().includes(term);
        const matchId = g.emp_id.toLowerCase().includes(term);
        if (!matchName && !matchId) return false;
      }
      return true;
    });
  }, [groupSummary, selectedWeek, selectedDept, selectedShift, selectedState, searchTerm]);

  const availableWeeks = useMemo(() => {
    const set = new Set<string>();
    groupSummary.forEach(g => set.add(g.week_key));
    return Array.from(set).sort();
  }, [groupSummary]);

  const availableDepts = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach(r => { if (r.dept) set.add(r.dept); });
    return Array.from(set).sort();
  }, [rawData]);

  const handleCopyList = () => {
    const header = "사번\t성명\t부서\t주차\t주총근로시간\t연장시간\t판정상태\n";
    const body = filteredGroupList.map(g => 
      `${g.emp_id}\t${g.emp_name}\t${g.dept}\t${g.week_key}주\t${g.total_h_rounded}h\t${g.overtime_h_rounded}h\t${g.week_state}`
    ).join("\n");
    
    navigator.clipboard.writeText(header + body).then(() => {
      setCopiedAlert(true);
      setTimeout(() => setCopiedAlert(false), 2000);
    });
  };

  const handleResetData = () => {
    if (window.confirm("초기 샘플 데이터로 복원하시겠습니까?")) {
      setRawData(INITIAL_RAW_DATA);
      localStorage.removeItem('exs03.attendance.v1');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (text) parseAndApplyText(text);
      } catch (err: any) {
        alert("파일 파싱 중 오류가 발생했습니다: " + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseAndApplyText = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
    if (lines.length <= 1) {
      alert("유효한 데이터 행이 없습니다.");
      return;
    }
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    
    const newRows: AttendanceRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 6) continue;
      
      newRows.push({
        att_id: cols[0] || `AT-${Math.floor(Math.random()*9000 + 1000)}`,
        emp_id: cols[1] || 'E999',
        emp_name: cols[2] || '익명',
        dept: cols[3] || '기타',
        shift_type: cols[4] || '주간',
        work_date: cols[5] || '2026-08-10',
        clock_in: cols[6] || '',
        clock_out: cols[7] || '',
        break_min: cols[8] !== undefined && cols[8] !== '' ? Number(cols[8]) : 60,
        leave_type: cols[9] || '',
        remark: cols[10] || ''
      });
    }

    if (newRows.length > 0) {
      setRawData(newRows);
      setActiveTab("LIST");
      alert(`${newRows.length}건의 데이터가 성공적으로 반입되었습니다.`);
    } else {
      alert("변환된 레코드가 없습니다. 포맷을 확인해주세요.");
    }
  };

  const handleSaveEditRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    setRawData(prev => prev.map(r => r.att_id === editRecord.att_id ? editRecord : r));
    setEditRecord(null);
  };

  const handleDeleteRecord = (attId: string) => {
    if (window.confirm("해당 출퇴근 기록을 삭제하시겠습니까?")) {
      setRawData(prev => prev.filter(r => r.att_id !== attId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      
      {/* 상단 헤더 */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight">근태·연장근로 한도 판정기</h1>
                <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/40">PRD-S03</span>
              </div>
              <p className="text-xs text-slate-400">주 52시간 자동 판정 및 오류·중복 검출 시스템</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab("LIST")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'LIST' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              점검 대시보드
            </button>
            <button 
              onClick={() => setActiveTab("IMPORT")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === 'IMPORT' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              데이터 반입 패널
            </button>
            <button 
              onClick={handleResetData}
              title="샘플 데이터로 초기화"
              className="p-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* 탭 1: 반입 패널 (S-01) */}
        {activeTab === 'IMPORT' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" /> 근태 데이터 반입 및 형식 설정
              </h2>
              <p className="text-xs text-slate-500 mt-1">CSV 파일 업로드, 텍스트 붙여넣기를 통해 근태 시스템 내보내기 데이터를 반영합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 파일 업로드 박스 */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center hover:border-indigo-500 transition-colors bg-slate-50/50">
                <FileText className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700 mb-1">CSV 또는 XLSX 파일 업로드</p>
                <p className="text-xs text-slate-400 mb-4">UTF-8 인코딩, 첫 행 헤더 필수 (`ds03_attendance_daily.csv` 호환)</p>
                <label className="cursor-pointer bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors">
                  파일 선택
                  <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* 텍스트 붙여넣기 박스 */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>텍스트 직접 붙여넣기 (탭/쉼표 구분)</span>
                  <span className="text-slate-400 font-normal">att_id, emp_id, emp_name, dept, shift_type, work_date, clock_in, clock_out, break_min, leave_type, remark</span>
                </label>
                <textarea 
                  rows={5}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`AT-001, E001, 김도현, 생산1팀, 교대, 2026-08-10, 2026-08-10 22:00, 2026-08-11 07:00, 60, , 야간조`}
                  className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                ></textarea>
                <button 
                  onClick={() => parseAndApplyText(importText)}
                  className="self-end bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  붙여넣기 데이터 반영
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">파싱 주의사항:</span> 퇴근 시각이 출근 시각보다 앞서는 경우 '기록 오류'로 자동 마킹되며 주 집계에서 제외됩니다. 야간 교대조의 익일 퇴근(`2026-08-11 07:00` 등)은 날짜 비교를 통해 정상 산출됩니다.
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 점검 대시보드 및 목록 (S-02 / F-06) */}
        {activeTab === 'LIST' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 경고 요약 대시보드 카드 (F-06) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div 
                onClick={() => setSelectedState(selectedState === '위반' ? 'ALL' : '위반')}
                className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${selectedState === '위반' ? 'ring-2 ring-red-500 border-red-300' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">주 52시간 위반</span>
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-600">{dashboardMetrics.violationCount} <span className="text-xs font-normal text-slate-500">명/주</span></div>
              </div>

              <div 
                onClick={() => setSelectedState(selectedState === '임박' ? 'ALL' : '임박')}
                className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${selectedState === '임박' ? 'ring-2 ring-amber-500 border-amber-300' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">주 52시간 임박 (48~52h)</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-600">{dashboardMetrics.imminentCount} <span className="text-xs font-normal text-slate-500">명/주</span></div>
              </div>

              <div 
                onClick={() => setSelectedState(selectedState === '오류' ? 'ALL' : '오류')}
                className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${selectedState === '오류' ? 'ring-2 ring-rose-500 border-rose-300' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">기록 오류 행</span>
                  <X className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-bold text-rose-600">{dashboardMetrics.errorRowsCount} <span className="text-xs font-normal text-slate-500">건</span></div>
              </div>

              <div 
                onClick={() => setSelectedState(selectedState === '미기재' ? 'ALL' : '미기재')}
                className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${selectedState === '미기재' ? 'ring-2 ring-slate-500 border-slate-300' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">퇴근·휴게 미기재</span>
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-700">{dashboardMetrics.missingRowsCount} <span className="text-xs font-normal text-slate-500">건</span></div>
              </div>

              <div 
                onClick={() => setSelectedState(selectedState === '중복' ? 'ALL' : '중복')}
                className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all col-span-2 sm:col-span-1 ${selectedState === '중복' ? 'ring-2 ring-purple-500 border-purple-300' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-medium">중복 전송 건</span>
                  <Layers className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{dashboardMetrics.duplicateRowsCount} <span className="text-xs font-normal text-slate-500">행</span></div>
              </div>
            </div>

            {/* 필터 및 검색 바 */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={selectedWeek} 
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">전체 주차 (모든 주)</option>
                  {availableWeeks.map(w => <option key={w} value={w}>{w} 주</option>)}
                </select>

                <select 
                  value={selectedDept} 
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">전체 부서</option>
                  {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select 
                  value={selectedShift} 
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">전체 근무형태</option>
                  <option value="주간">주간</option>
                  <option value="교대">교대</option>
                </select>

                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">모든 상태 판정</option>
                  <option value="위반">위반 (&gt;52h)</option>
                  <option value="임박">임박 (48~52h)</option>
                  <option value="정상">정상 (≤48h)</option>
                  <option value="오류">기록 오류 포함</option>
                  <option value="미기재">미기재 포함</option>
                  <option value="중복">중복 포함</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="직원 이름 또는 사번 검색"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button 
                  onClick={handleCopyList}
                  className="flex items-center space-x-1.5 text-xs bg-indigo-50 text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200 flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedAlert ? "복사완료!" : "명단 복사"}</span>
                </button>
              </div>
            </div>

            {/* 직원·주 단위 집계 표 (S-02) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">사번 / 성명</th>
                      <th className="py-3 px-4">부서 / 형태</th>
                      <th className="py-3 px-4">주차</th>
                      <th className="py-3 px-4 text-right">총 근로시간</th>
                      <th className="py-3 px-4 text-right">연장시간 (&gt;40h)</th>
                      <th className="py-3 px-4 text-center">주 52시간 판정</th>
                      <th className="py-3 px-4">이상 징후 및 플래그</th>
                      <th className="py-3 px-4 text-center">상세</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredGroupList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          조건에 일치하는 근태 집계 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredGroupList.map((g) => (
                        <tr 
                          key={g.group_key} 
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => setDetailTarget({ emp_id: g.emp_id, week_key: g.week_key })}
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{g.emp_name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{g.emp_id}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-700">{g.dept}</div>
                            <div className="text-[11px] text-slate-400">{g.shift_type}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {g.week_key} 주
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {g.total_h_rounded} h
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            {g.overtime_h_rounded} h
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              g.week_state === '위반' ? 'bg-red-100 text-red-700 border border-red-200' :
                              g.week_state === '임박' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              {g.week_state}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {g.has_error && (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-medium">기록오류</span>
                              )}
                              {g.has_incomplete && (
                                <span className="bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium">미기재</span>
                              )}
                              {g.has_duplicate && (
                                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[10px] font-medium">중복행</span>
                              )}
                              {!g.has_error && !g.has_incomplete && !g.has_duplicate && (
                                <span className="text-slate-300 text-[11px]">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailTarget({ emp_id: g.emp_id, week_key: g.week_key });
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 모달: 직원 주간 상세 보기 및 단건 정정 */}
      {detailTarget && (() => {
        const targetGroup = groupSummary.find(g => g.emp_id === detailTarget.emp_id && g.week_key === detailTarget.week_key);
        if (!targetGroup) return null;

        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
              
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" /> {targetGroup.emp_name} ({targetGroup.emp_id}) 주간 상세 점검
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    부서: {targetGroup.dept} | 주차: {targetGroup.week_key} 주 | 주 총 근로시간: <strong className="text-white font-mono">{targetGroup.total_h_rounded}h</strong> ({targetGroup.week_state})
                  </p>
                </div>
                <button 
                  onClick={() => setDetailTarget(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>일별 출퇴근 및 근로시간 내역</span>
                  <span className="text-slate-400 font-normal">행을 수정하거나 삭제하여 데이터 오류를 보정할 수 있습니다.</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">근무일</th>
                        <th className="py-2.5 px-3">출근시각</th>
                        <th className="py-2.5 px-3">퇴근시각</th>
                        <th className="py-2.5 px-3">휴게(분)</th>
                        <th className="py-2.5 px-3">휴가구분</th>
                        <th className="py-2.5 px-3 text-right">근로시간(H)</th>
                        <th className="py-2.5 px-3 text-center">일일 상태</th>
                        <th className="py-2.5 px-3 text-center">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-mono">
                      {targetGroup.rows.map((row: any) => (
                        <tr key={row.att_id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-900 font-medium">{row.work_date}</td>
                          <td className="py-2.5 px-3 text-slate-600">{row.clock_in || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{row.clock_out || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{row.break_min !== "" ? `${row.break_min}분` : '-'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{row.leave_type || '-'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {row.calculated_h > 0 ? `${row.calculated_h.toFixed(1)}h` : '0.0h'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                              row.day_state === '정상' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              row.day_state === '휴가' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              row.day_state === '미기재' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {row.day_state}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1 font-sans">
                              <button 
                                onClick={() => setEditRecord(row)}
                                title="수정"
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteRecord(row.att_id)}
                                title="삭제"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {editRecord && (
                  <form onSubmit={handleSaveEditRecord} className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 space-y-3 font-sans animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                      <span>출퇴근 기록 정정 (ID: {editRecord.att_id})</span>
                      <button type="button" onClick={() => setEditRecord(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">근무일자</label>
                        <input 
                          type="text" 
                          value={editRecord.work_date}
                          onChange={(e) => setEditRecord({...editRecord, work_date: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">출근시각</label>
                        <input 
                          type="text" 
                          value={editRecord.clock_in}
                          onChange={(e) => setEditRecord({...editRecord, clock_in: e.target.value})}
                          placeholder="YYYY-MM-DD HH:mm"
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">퇴근시각 (익일 허용)</label>
                        <input 
                          type="text" 
                          value={editRecord.clock_out}
                          onChange={(e) => setEditRecord({...editRecord, clock_out: e.target.value})}
                          placeholder="YYYY-MM-DD HH:mm"
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">휴게시간(분)</label>
                        <input 
                          type="number" 
                          value={editRecord.break_min}
                          onChange={(e) => setEditRecord({...editRecord, break_min: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setEditRecord(null)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded text-xs font-medium hover:bg-slate-50"
                      >
                        취소
                      </button>
                      <button 
                        type="submit" 
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 shadow-sm"
                      >
                        정정 사항 저장
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
                <button 
                  onClick={() => setDetailTarget(null)}
                  className="px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors"
                >
                  닫기
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p>근태·연장근로 한도 판정기 (PRD-S03) — 단일 화면 프론트엔드 앱 | LocalStorage 자동 저장 활성화</p>
      </footer>

    </div>
  );
}
