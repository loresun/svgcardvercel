import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>404 - 页面未找到</h1>
      <p>您访问的页面不存在。</p>
      <Link href="/">返回首页</Link>
    </div>
  );
} 