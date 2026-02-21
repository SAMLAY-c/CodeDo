import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Image, Video, CheckCircle, XCircle, Loader2, Tag, X, ExternalLink } from 'lucide-react';
import { saveArticle } from '../utils/storage';

// 文件类型常量
export const FileType = {
  HTML: 'html',
  IMAGE: 'image',
  VIDEO: 'video'
} as const;

export type FileType = typeof FileType[keyof typeof FileType];

// 分类常量
export const Category = {
  ARTICLE: 'article',        // 文章博客
  MEDIA: 'media',            // 媒体资源
  TECH: 'tech',              // 技术文档
  CUSTOM: 'custom'           // 自定义
} as const;

export type Category = typeof Category[keyof typeof Category];

interface UploadResult {
  success: boolean;
  id?: string;
  filename: string;
  fileType: FileType;
  title: string;
  category: Category;
  tags: string[];
  size: number;
  url?: string;
  content?: string;
}

const FileUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>(FileType.HTML);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(Category.ARTICLE);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 文件类型对应的 MIME 类型
  const fileTypes = {
    [FileType.HTML]: {
      accept: '.html,.htm',
      mime: 'text/html',
      icon: <FileText className="w-10 h-10 text-cyan-400" />,
      label: 'HTML 文档'
    },
    [FileType.IMAGE]: {
      accept: 'image/jpeg,image/png,image/gif,image/webp',
      mime: 'image/',
      icon: <Image className="w-10 h-10 text-green-400" />,
      label: '图片文件'
    },
    [FileType.VIDEO]: {
      accept: 'video/mp4,video/webm,video/ogg',
      mime: 'video/',
      icon: <Video className="w-10 h-10 text-purple-400" />,
      label: '视频文件'
    }
  };

  const categories = [
    { value: Category.ARTICLE, label: '文章博客', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: Category.MEDIA, label: '媒体资源', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: Category.TECH, label: '技术文档', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: Category.CUSTOM, label: '自定义', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 验证文件类型
    const typeConfig = fileTypes[fileType];
    const isValidType =
      fileType === FileType.HTML
        ? selectedFile.type === 'text/html'
        : selectedFile.type.startsWith(typeConfig.mime);

    if (isValidType) {
      setFile(selectedFile);
      // 如果是 HTML，尝试提取文件名作为默认标题
      if (fileType === FileType.HTML && !title) {
        setTitle(selectedFile.name.replace(/\.(html?|htm)$/i, ''));
      }
      setError(null);
      setResult(null);
    } else {
      setError(`请选择${typeConfig.label}`);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!file) {
      setError('请选择文件');
      return;
    }

    if (!title.trim()) {
      setError('请输入标题');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('tags', JSON.stringify(tags));

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 保存文章到本地存储
        saveArticle(data);

        setResult(data);

        // 3秒后自动跳转到文章页面
        setTimeout(() => {
          navigate(`/article/${data.id}`);
        }, 2000);
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
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8">
        <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3">
          <Upload className="w-6 h-6 text-cyan-400" />
          内容上传
        </h2>

        {/* 文件类型选择 */}
        <div className="mb-6">
          <label className="text-white/80 text-sm mb-2 block">文件类型</label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(fileTypes).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setFileType(type as FileType)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  fileType === type
                    ? 'border-cyan-400 bg-cyan-500/20'
                    : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
              >
                {config.icon}
                <span className="text-white/80 text-sm">{config.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 上传区域 */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={fileTypes[fileType].accept}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-cyan-500/40 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-cyan-500/5 transition-all"
          >
            {fileTypes[fileType].icon}
            <p className="text-white/80 text-sm mt-3">
              {file ? file.name : `点击选择或拖拽${fileTypes[fileType].label}`}
            </p>
            <p className="text-white/40 text-xs mt-1">
              {file ? formatSize(file.size) : '最大 50MB'}
            </p>
          </label>
        </div>

        {/* 标题输入 */}
        <div className="mb-6">
          <label className="text-white/80 text-sm mb-2 block">标题 <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入内容标题"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none transition-all"
          />
        </div>

        {/* 分类选择 */}
        <div className="mb-6">
          <label className="text-white/80 text-sm mb-2 block">分类</label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value as Category)}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  category === cat.value
                    ? cat.color
                    : 'border-white/10 text-white/60 hover:border-white/30 bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 标签输入 */}
        <div className="mb-6">
          <label className="text-white/80 text-sm mb-2 block">标签</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="输入标签后按回车"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none transition-all"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-xl transition-all"
            >
              <Tag className="w-5 h-5" />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm"
                >
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-cyan-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 上传按钮 */}
        {file && (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                setTitle('');
                setTags([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
            >
              取消
            </button>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">上传失败</p>
              <p className="text-red-400/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 成功结果 */}
        {result && (
          <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-400 font-medium mb-2">上传成功！正在跳转到文章页面...</p>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <p className="text-white/70">
                  <span className="text-white/40">文件名：</span>
                  {result.filename}
                </p>
                <p className="text-white/70">
                  <span className="text-white/40">标题：</span>
                  {result.title}
                </p>
                <p className="text-white/70">
                  <span className="text-white/40">类型：</span>
                  {fileTypes[result.fileType].label}
                </p>
                <p className="text-white/70">
                  <span className="text-white/40">分类：</span>
                  {categories.find(c => c.value === result.category)?.label}
                </p>
                <p className="text-white/70">
                  <span className="text-white/40">大小：</span>
                  {formatSize(result.size)}
                </p>
                {result.tags && result.tags.length > 0 && (
                  <p className="text-white/70 col-span-2">
                    <span className="text-white/40">标签：</span>
                    {result.tags.join(', ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate(`/article/${result.id}`)}
                className="w-full px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                立即查看文章
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
