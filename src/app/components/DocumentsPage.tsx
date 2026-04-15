import React, { useEffect, useState } from 'react';
import { Eye, Download, X, FileText, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Doc = { id: string; name: string; link: string; createdAt: number };

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [viewDoc, setViewDoc] = useState<Doc | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Danh sách các tài liệu cứng có sẵn trong thư mục /public/docs/ (hoặc /docs/ khi build)
  const STATIC_DOCS: Doc[] = [
    {
      id: 'doc-600-cau-hoi',
      name: 'Bộ 600 câu hỏi dùng cho sát hạch lái xe cơ giới đường bộ',
      link: '/docs/273963059_Bộ 600 câu hỏi dùng cho sát hạch lái xe cơ giới đường bộ.pdf',
      createdAt: new Date('2024-01-01').getTime()
    }
    // Bạn có thể thêm các file khác vào đây...
  ];

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('documents') : null;
      let parsedDocs: Doc[] = [];
      
      if (raw) {
        const parsed = JSON.parse(raw) as Doc[];
        if (Array.isArray(parsed)) {
          parsedDocs = parsed;
        }
      }
      
      // Kết hợp tài liệu cứng và tài liệu thêm từ localStorage (nếu có để quản trị)
      setDocuments([...STATIC_DOCS, ...parsedDocs]);
    } catch (err) {
      console.error('Failed to load documents from localStorage', err);
      setDocuments([...STATIC_DOCS]);
    }
  }, []);

  const handleDownload = (link: string, name: string) => {
    const a = document.createElement('a');
    a.href = link;
    a.download = name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-gradient-to-b from-transparent via-blue-50/30 to-transparent animate-fade-in overflow-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4"
          >
            <FileText className="w-8 h-8 text-blue-600" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-white drop-shadow-lg mb-4"
          >
            Tài Liệu Học Tập
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow"
          >
            Khám phá và tải xuống các tài liệu ôn tập, đề thi tham khảo và bài giảng được cập nhật mới nhất.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 relative max-w-2xl mx-auto"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-shadow hover:shadow-md"
          />
        </motion.div>

        {/* Documents List */}
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {filteredDocs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm"
              >
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy tài liệu</h3>
                <p className="mt-1 text-gray-500">
                  {searchTerm ? 'Thử tìm kiếm với từ khóa khác.' : 'Hiện tại chưa có tài liệu nào được đăng tải.'}
                </p>
              </motion.div>
            ) : (
              filteredDocs.map((d, index) => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-5 lg:p-7 rounded-3xl shadow-sm border border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] hover:-translate-y-2 hover:border-blue-200 transition-all duration-300 group flex flex-col justify-between gap-5 h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50/60 to-transparent rounded-bl-[120px] -z-10 group-hover:scale-125 transition-transform duration-700"></div>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 lg:gap-5 min-w-0 w-full relative z-10">
                    <div className="p-4 bg-blue-50/80 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md transition-all duration-300 shrink-0">
                      <FileText size={28} className="lg:w-8 lg:h-8" />
                    </div>
                    <div className="min-w-0 flex-1 w-full pt-1 lg:pt-2">
                      <h3 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors break-words line-clamp-2 text-base md:text-lg lg:text-xl mb-1.5 leading-snug">
                        {d.name}
                      </h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1 lg:gap-2 mt-2 text-xs lg:text-sm text-gray-500 font-medium">
                        <span className="flex items-center">
                          {new Date(d.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric', month: '2-digit', day: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 lg:gap-4 w-full justify-between sm:justify-end border-t pt-5 lg:pt-6 border-gray-50 mt-auto relative z-10">
                    <button
                      onClick={() => setViewDoc(d)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 lg:py-3 text-sm lg:text-base font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                      <Eye size={18} />
                      <span className="hidden lg:inline">Xem trực tiếp</span>
                      <span className="inline lg:hidden">Xem</span>
                    </button>
                    <button
                      onClick={() => handleDownload(d.link, d.name)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 lg:py-3 text-sm lg:text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-500/30 rounded-xl transition-all"
                    >
                      <Download size={18} />
                      <span className="hidden lg:inline">Tải về</span>
                      <span className="inline lg:hidden">Tải</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Document Viewer Modal */}
        <AnimatePresence>
          {viewDoc && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                      <FileText size={20} />
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate w-full">{viewDoc.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button 
                      onClick={() => handleDownload(viewDoc.link, viewDoc.name)} 
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                    >
                      <Download size={16} />
                      <span className="hidden sm:inline">Tải xuống</span>
                    </button>
                    <button 
                      onClick={() => setViewDoc(null)} 
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 p-2 sm:p-4">
                  <iframe 
                    src={viewDoc.link} 
                    className="w-full h-full rounded-xl bg-white shadow-sm border border-gray-200" 
                    title={viewDoc.name} 
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DocumentsPage;
