import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface UploadResult {
  success: boolean;
  filename: string;
  size: number;
  title: string;
  content: string;
}

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/html') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('请选择 HTML 文件');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.error || '上传失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8">
        <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3">
          <Upload className="w-6 h-6 text-cyan-400" />
          上传 HTML 文档
        </h2>

        {/* Upload Area */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-cyan-500/40 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-cyan-500/5 transition-all"
          >
            <FileText className="w-10 h-10 text-cyan-400 mb-3" />
            <p className="text-white/80 text-sm">
              {file ? file.name : '点击选择或拖拽 HTML 文件'}
            </p>
            <p className="text-white/40 text-xs mt-1">最大 10MB</p>
          </label>
        </div>

        {/* Upload Button */}
        {file && (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  开始上传
                </>
              )}
            </button>
            <button
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
            >
              取消
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">上传失败</p>
              <p className="text-red-400/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-400 font-medium mb-2">上传成功</p>
              <div className="space-y-1 text-sm">
                <p className="text-white/70">
                  <span className="text-white/40">文件名：</span>
                  {result.filename}
                </p>
                <p className="text-white/70">
                  <span className="text-white/40">标题：</span>
                  {result.title}
                </p>
                <p className="text-white/70">
                  <span className="text-white/40">大小：</span>
                  {formatSize(result.size)}
                </p>
                <p className="text-white/70">
                  <span className="text-white/40">内容长度：</span>
                  {result.content.length} 字符
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
