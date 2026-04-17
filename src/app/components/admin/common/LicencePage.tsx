import React, { useState, useEffect } from 'react';
import { LicenceService } from '../../../services/licenceService';
import { PlusIcon, TrashIcon, PencilSquareIcon, ArrowLeftIcon,
  ListBulletIcon, ClockIcon, AcademicCapIcon,
  CheckBadgeIcon, MagnifyingGlassIcon, HashtagIcon,
  InboxIcon, BeakerIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import { url } from '../../../../env.js';
import apiClient from '../../../api/axiosClient';

const LicenceCardSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 animate-pulse">
    <div className="flex justify-between items-start mb-8">
      <div className="w-14 h-14 bg-slate-100 rounded-xl" />
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-slate-50 rounded-lg" />
        <div className="w-8 h-8 bg-slate-50 rounded-lg" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-3 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
  </div>
);

const LicenceManagement: React.FC = () => {
  // --- STATES ---
  const [licences, setLicences] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [showToast, setShowToast] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  });

  const [formData, setFormData] = useState<any>({
    licenceCode: '',
    duration: 0,
    passScore: 0,
    QuestionCount: 0,
    licenceRule: []
  });

  // --- LOGIC TÍNH TOÁN (XỬ LÝ THỪA/THIẾU) ---
  const currentTotal = (formData.licenceRule ?? []).reduce((sum: number, r: any) => sum + (Number(r.questionCount) || 0), 0);
  const diff = formData.QuestionCount - currentTotal;
  const isInvalid = !formData.licenceCode.trim() || formData.QuestionCount <= 0 || formData.duration <= 0 || formData.passScore <= 0 || formData.licenceRule.length === 0;
  const isPerfect = diff === 0 && formData.QuestionCount > 0 && !isInvalid;

  const getButtonText = () => {
    if (isPerfect) return 'Lưu văn bằng ngay';
    if (!formData.licenceCode.trim()) return 'Nhập mã văn bằng';
    if (formData.QuestionCount <= 0) return 'Nhập tổng số câu';
    if (diff > 0) return `Còn thiếu ${diff} câu phân bổ`;
    if (diff < 0) return `Đang thừa ${Math.abs(diff)} câu phân bổ`; // Dùng trị tuyệt đối để không bị số âm
    return 'Cấu hình chưa hợp lệ';
  };

  // --- FUNCTIONS ---
  useEffect(() => { loadData(); }, []);

  const triggerToast = (msg: string, type: 'success' | 'error') => {
    setShowToast({ show: true, msg, type });
    setTimeout(() => setShowToast(prev => ({ ...prev, show: false })), 3000);
  };

  const sanitizeData = (data: any) => {
    if (!data) return data;
  const rawId = data.licenceId ?? data.LicenceId ?? data.id ?? data.Id ?? data.licenseId ?? data.LicenseId;
  const normalizedId = rawId !== undefined && rawId !== null ? Number(rawId) : undefined;
    return {
      ...data,
      licenceId: normalizedId,
      id: normalizedId,
      licenceCode: data.licenceCode || data.LicenceCode || '',
      duration: Number(data.duration || data.Duration || 0),
      passScore: Number(data.passScore || data.PassScore || 0),
      QuestionCount: Number(data.totalQuestion || data.QuestionCount || data.questionCount || 0),
      licenceRule: (data.licenceRule || data.licenceRules || []).map((r: any) => ({
        categoryId: Number(r.categoryId || r.CategoryId || r.categoryID || r.CategoryID || 0),
        categoryName: r.categoryName || r.CategoryName || '',
        questionCount: Number(r.questionCount || r.QuestionCount || 0)
      }))
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Lấy tổng số lượng câu hỏi hiện tại trong ngân hàng
    apiClient.get('/CauHoi', { params: { SoLuong: 1 } })
    .then(res => {
      const data = res.data;
      if (data && data.questionCount !== undefined) {
        setTotalQuestions(data.questionCount);
      }
    })
    .catch(err => console.error("Error fetching total questions:", err));

      const [resVB, resC] = await Promise.all([
        LicenceService.getAllLicences(),
        LicenceService.getCategories()
      ]);
  setLicences((resVB || []).map((l: any) => sanitizeData(l)));
  setCategories(resC || []);
    } catch (err) {
      triggerToast("Lỗi tải dữ liệu!", "error");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleSave = async () => {
    if (!isPerfect) return;
    try {
      const payload = {
        licenceCode: formData.licenceCode,
        duration: Number(formData.duration),
        passScore: Number(formData.passScore),
        totalQuestion: Number(formData.QuestionCount),
        questionCount: Number(formData.QuestionCount),
        licenceRule: (formData.licenceRule || []).map((rule: any) => ({
          categoryId: Number(rule.categoryId),
          questionCount: Number(rule.questionCount)
        }))
      } as any;
      const editId = formData.licenceId ?? formData.id ?? formData.LicenceId ?? formData.Id ?? formData.licenseId ?? formData.LicenseId;
      if (editId !== undefined && editId !== null) {
        payload.licenceId = Number(editId);
        payload.id = Number(editId);
      }
      if (editId !== undefined && editId !== null) {
        await LicenceService.updateLicence(Number(editId), payload);
        triggerToast("Cập nhật thành công!", "success");
      } else {
        await LicenceService.createLicence(payload);
        triggerToast("Tạo mới thành công!", "success");
      }
      setIsEditing(false); loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Lỗi lưu dữ liệu!';
      triggerToast(message, 'error');
      console.error('Licence save failed', err);
    }
  };

  const handleQuestionCountChange = (val: number) => {
    const count = Math.max(0, val);
    setFormData({
      ...formData,
      QuestionCount: count,
      duration: Math.round(count * 0.6),
      passScore: Math.round(count * 0.9)
    });
  };

  const updateRule = (index: number, field: string, value: any) => {
    const newRules = [...(formData.licenceRule ?? [])];
    if (field === 'categoryId') {
      const selectedCat = categories.find(c => Number(c.categoryId) === Number(value));
      newRules[index] = { ...newRules[index], categoryId: Number(value), categoryName: selectedCat?.categoryName || '' };
    } else {
      let numVal = Math.max(0, Number(value));
      if (field === 'questionCount') {
        const otherTotal = newRules.reduce((sum, r, i) => sum + (i === index ? 0 : (Number(r.questionCount) || 0)), 0);
        const maxAllowed = Math.max(0, (formData.QuestionCount || formData.questionCount || 0) - otherTotal);
        numVal = Math.min(numVal, maxAllowed);
      }
      newRules[index] = { ...newRules[index], [field]: numVal };
    }
    setFormData({ ...formData, licenceRule: newRules });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans relative text-left">
      {!isEditing ? (
        <>
          {/* HEADER 2 TẦNG INDIGO */}
          <header className="sticky top-0 z-30 bg-white border-b border-indigo-100 shadow-sm">
            <div className="max-w-[1600px] mx-auto flex flex-col">
              <div className="px-6 h-16 flex items-center justify-between gap-4 border-b border-indigo-50">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    <AcademicCapIcon className="h-6 w-6 text-white stroke-[2.5]" />
                  </div>
                  <span className="font-black text-slate-800 hidden lg:block uppercase tracking-tighter text-sm italic">
                    Quản lý văn bằng
                  </span>
                </div>

                <div className="flex-1 max-w-2xl relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã bằng (A1, B2, C...)"
                    className="w-full pl-12 pr-4 py-2.5 bg-indigo-50/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-indigo-100 outline-none font-bold placeholder:text-indigo-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setFormData({ licenceCode: '', duration: 0, passScore: 0, QuestionCount: 0, licenceRule: [] }); setIsEditing(true); }}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5 stroke-[3]" /> Thêm mới
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 bg-indigo-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-indigo-900/40 uppercase tracking-widest italic">
                    Hệ thống đang hoạt động • {licences.length} loại bằng
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-[1600px] mx-auto px-6 py-12">
            {licences.filter(l => l.licenceCode.toUpperCase().includes(searchTerm.toUpperCase())).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                  [...Array(6)].map((_, i) => <LicenceCardSkeleton key={i} />)
                ) : (
                  licences
                    .filter(l => l.licenceCode.toUpperCase().includes(searchTerm.toUpperCase()))
                    .map((l, idx) => (
                      <div key={l.licenceId || l.id || idx} className="group bg-white rounded-[2.5rem] p-1 border border-indigo-50 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 opacity-80" />

                        <div className="p-8">
                          <div className="flex justify-between items-start mb-10">
                            <div className="relative">
                              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black uppercase italic rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-xl border border-indigo-100">
                                {l.licenceCode}
                              </div>
                              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                                <CheckBadgeIcon className="h-4 w-4 text-white" />
                              </div>
                            </div>

                            <div className="flex gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              <button onClick={() => { setFormData(sanitizeData(l)); setIsEditing(true); }} className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-100"><PencilSquareIcon className="h-5 w-5" /></button>
                              <button onClick={() => {
                                const deleteId = l.licenceId ?? l.id ?? l.LicenceId ?? l.Id ?? l.licenseId ?? l.LicenseId;
                                if (window.confirm("Xóa văn bằng này?") && deleteId !== undefined && deleteId !== null) {
                                  LicenceService.deleteLicence(Number(deleteId)).then(loadData);
                                }
                              }} className="p-2.5 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white rounded-xl transition-all shadow-sm border border-red-100"><TrashIcon className="h-5 w-5" /></button>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 transition-colors group-hover:bg-indigo-50">
                                <p className="text-[8px] font-black text-indigo-400 uppercase mb-1 flex items-center gap-1 tracking-widest"><ClockIcon className="h-3 w-3" /> Thời gian</p>
                                <span className="text-xl font-black text-slate-800">{l.duration} <small className="text-[10px] text-indigo-300 font-bold uppercase tracking-tighter">phút</small></span>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-colors group-hover:bg-indigo-50 group-hover:border-indigo-100">
                                <p className="text-[8px] font-black text-slate-400 group-hover:text-indigo-400 uppercase mb-1 flex items-center gap-1 tracking-widest"><ListBulletIcon className="h-3 w-3" /> Tổng câu</p>
                                <span className="text-xl font-black text-slate-800 group-hover:text-indigo-600">{l.QuestionCount} <small className="text-[10px] text-slate-300 group-hover:text-indigo-300 font-bold uppercase tracking-tighter">câu</small></span>
                              </div>
                            </div>

                            <div className="relative overflow-hidden bg-indigo-800 rounded-2xl p-4 flex items-center justify-between group-hover:scale-[1.02] transition-transform shadow-lg shadow-indigo-900/20">
                              <div className="z-10 text-left">
                                <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">Yêu cầu tối thiểu</p>
                                <p className="text-white font-black text-lg tracking-tight italic">Đạt {l.passScore} câu</p>
                              </div>
                              <div className="z-10 text-right">
                                <div className="text-[10px] font-black text-emerald-400 px-3 py-1 bg-emerald-400/10 rounded-full border border-emerald-400/20 backdrop-blur-sm">
                                  {Math.round((l.passScore / l.QuestionCount) * 100)}%
                                </div>
                              </div>
                              <HashtagIcon className="absolute -right-4 -bottom-4 h-20 w-20 text-white/[0.03] -rotate-12" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-indigo-100">
                <InboxIcon className="h-16 w-16 text-indigo-100 mx-auto mb-4" />
                <p className="text-indigo-300 font-black uppercase text-xs tracking-widest">Không có kết quả tìm kiếm</p>
              </div>
            )}
          </main>
        </>
      ) : (
        /* UI EDITING */
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="flex items-center justify-between mb-10 border-b border-indigo-50 pb-8">
            <button onClick={() => setIsEditing(false)} className="flex items-center bg-white px-5 py-2.5 rounded-xl text-indigo-400 font-black hover:text-indigo-600 border border-indigo-100 shadow-sm transition-all uppercase text-[10px] tracking-widest">
              <ArrowLeftIcon className="h-4 w-4 mr-2 stroke-[3]" /> Quay lại
            </button>
            <div className="text-right">
              <h2 className="text-xl font-[1000] text-indigo-950 italic uppercase tracking-tighter">
                {formData.licenceId ? 'Cập nhật cấu trúc' : 'Thiết lập văn bằng'}
              </h2>
              <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Indigo System Config</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-6 text-left">
              <div className="bg-white p-8 rounded-[2rem] border border-indigo-50 shadow-sm space-y-6">
                <div>
                  <label className="text-[9px] font-black text-indigo-400 block mb-2 uppercase tracking-widest italic">Mã bằng</label>
                  <input type="text" placeholder="VD: B2" className="w-full px-5 py-3.5 bg-indigo-50/30 rounded-xl font-black outline-none border-2 border-indigo-50 focus:border-indigo-600 focus:bg-white transition-all uppercase italic shadow-inner placeholder:text-indigo-200" value={formData.licenceCode} onChange={e => setFormData({ ...formData, licenceCode: e.target.value })} />
                </div>
                <div>
                  <label className="text-[9px] font-black text-indigo-600 block mb-2 uppercase tracking-widest">Tổng câu hỏi</label>
                  <input type="number" className="w-full px-5 py-3.5 bg-indigo-600/5 rounded-xl font-black text-indigo-700 outline-none border-2 border-indigo-100 focus:border-indigo-600 text-lg shadow-inner" value={formData.QuestionCount} onChange={e => handleQuestionCountChange(Number(e.target.value))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 block mb-2 uppercase tracking-widest text-left">Số phút</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold outline-none border-2 border-slate-100 focus:border-indigo-600 shadow-inner" value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 block mb-2 uppercase tracking-widest text-left">Điểm đạt</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold outline-none border-2 border-slate-100 focus:border-indigo-600 shadow-inner" value={formData.passScore} onChange={e => setFormData({ ...formData, passScore: Number(e.target.value) })} />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!isPerfect}
                className={`w-full py-5 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${!isPerfect
                  ? 'bg-indigo-50 text-indigo-200 cursor-not-allowed border border-indigo-100 shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 shadow-indigo-200'
                  }`}
              >
                {isPerfect && <CheckBadgeIcon className="h-5 w-5 text-emerald-400" />}
                {getButtonText()}
              </button>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-white p-8 rounded-[2rem] border border-indigo-50 shadow-sm min-h-[500px]">
                <div className="flex justify-between items-center mb-8 border-b border-indigo-50 pb-6">
                  <h3 className="text-[10px] font-black text-indigo-800 uppercase tracking-[0.2em] flex items-center italic">
                    <BeakerIcon className="h-5 w-5 mr-2 text-indigo-600" /> Cấu trúc phân bổ câu hỏi
                  </h3>
                  
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/50 shadow-sm" title="Số lượng câu hỏi đã phân bổ">
                        <DocumentTextIcon className="h-4 w-4 text-indigo-500 mr-1.5" />
                        <span className="text-[10px] font-black text-indigo-700 leading-none">
                          Đã phân bổ: {currentTotal} / {formData.questionCount || 0} câu
                        </span>
                      </div>

                        <button
                        onClick={() => {
                          if (currentTotal >= (formData.QuestionCount || formData.questionCount || 0)) return;
                          setFormData({ ...formData, licenceRule: [...(formData.licenceRule || []), { categoryId: categories[0]?.categoryId, questionCount: 0 }] });
                        }}
                        disabled={currentTotal >= (formData.QuestionCount || formData.questionCount || 0)}
                        className={`text-[9px] font-black px-5 py-2.5 rounded-xl border-2 transition-all uppercase tracking-widest ${
                          currentTotal >= (formData.QuestionCount || formData.questionCount || 0)
                            ? 'text-gray-400 border-gray-100 bg-gray-50 cursor-not-allowed'
                            : 'text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-600'
                        }`}
                      >
                        + Thêm chương
                      </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.licenceRule.map((rule: any, idx: number) => (
                    <div key={idx} className="flex flex-col md:flex-row items-center gap-4 p-5 bg-indigo-50/20 rounded-2xl border border-indigo-50 hover:border-indigo-300 transition-all">
                      <select
                        className="flex-1 bg-white border border-indigo-100 rounded-xl px-4 py-3.5 text-xs font-black shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer italic text-indigo-900 shadow-inner"
                        value={rule.categoryId}
                        onChange={e => updateRule(idx, 'categoryId', e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Số câu"
                            className="w-28 bg-white border border-indigo-100 rounded-xl pl-4 pr-10 py-3.5 text-sm font-black text-indigo-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-inner"
                            value={rule.questionCount}
                            onChange={e => updateRule(idx, 'questionCount', e.target.value)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-300 uppercase">Câu</span>
                        </div>
                        <button
                          onClick={() => setFormData({ ...formData, licenceRule: formData.licenceRule.filter((_: any, i: number) => i !== idx) })}
                          className="p-3 bg-white text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl border border-indigo-100 transition-all shadow-sm"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {formData.licenceRule.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed border-indigo-50 rounded-[2rem]">
                      <p className="text-indigo-200 font-black uppercase text-[10px] tracking-[0.3em] italic">Chưa có phân bổ chương học</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST INDIGO */}
      {showToast.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-8 py-4 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-8 border backdrop-blur-md ${showToast.type === 'success' ? 'bg-indigo-950/90 text-white border-indigo-700' : 'bg-red-600/90 text-white border-red-500'
          }`}>
          <CheckBadgeIcon className="h-5 w-5 text-emerald-400 shadow-sm" />
          <span className="font-black uppercase text-[10px] tracking-[0.2em]">{showToast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default LicenceManagement;
