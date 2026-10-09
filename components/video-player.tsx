"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * B 站视频「点击播放」：先显示封面 + 播放键，点一下才注入带 autoplay 的
 * 播放器 iframe。
 *
 * 为什么不用常驻 iframe（loading=lazy）：跨域 iframe 在 iOS Safari 上第一下
 * 点击常常只用来「激活」iframe 本身，播放键要点第二下才生效（用户反馈
 * 「视频点击播放不灵」）。点击目标换成同文档里的封面按钮后不存在这个问题——
 * 点击是真实的用户手势，注入 src 带 autoplay=1，播放器直接开播。
 *
 * 附带两个好处：① 播放器（几 MB 的 JS + 封面请求）只在用户真想看时才下载，
 * 不看视频的访客完全不付这份流量；② 播放器加载期间不再占据版面，封面先上屏。
 * preconnect 仍保留在 layout——用户点击时 DNS/TLS 已就绪，连接建立那几百毫秒
 * 省得掉。
 *
 * 声音的边界（实测 2026-10-09）：桌面 Chromium 系（allow="autoplay" + 本次点击
 * 手势）带声开播；WebKit（Safari 与 iOS 全部浏览器）有站点隔离，父文档的手势
 * 传不进跨域 iframe 文档，自动播放一律降为静音起步，播放器自带「点击恢复音量」
 * 一键恢复。这是平台策略，嵌入方无法覆盖（YouTube 嵌入同样如此）；试过并排除
 * 的绕法：muted=0 参数、播放器 postMessage 音量命令（协议里根本没有该命令，
 * 只有 play/pause 一类）、同步插入 iframe、iframe.allow 变体。
 */

/** 视频参数：换视频只改这里（aid/bvid/cid 与封面文件名一一对应） */
const VIDEO = {
  aid: "117346962312416",
  bvid: "BV1F9ai6REo8",
  cid: "42340451929",
  cover: "/images/video-cover-abc1691a.webp",
};

interface VideoPlayerProps {
  /** iframe 的 title（读屏与无障碍用） */
  title: string;
  /** 播放键的无障碍标签，如「点击播放」 */
  playLabel: string;
}

export default function VideoPlayer({ title, playLabel }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-[1440px] aspect-video rounded-lg overflow-hidden border border-white/15 shadow-2xl bg-black">
      {playing ? (
        <iframe
          // autoplay=1：点击注入即播放。浏览器对「用户手势中创建的 iframe」
          // 允许有声自动播放；若被策略拦住，播放器仍显示播放键可手动点。
          // allow="autoplay" 是 Permissions Policy：跨域 iframe 默认无权自动
          // 播放，Chromium 系桌面浏览器要显式授权才带声开播（配上层用户手势）。
          // muted=0 显式声明不强制静音。但 WebKit（Safari / iOS 上全部浏览器）
          // 有站点隔离：父文档的点击手势传不进跨域 iframe 文档，自动播放一律
          // 降为静音开播——这是平台策略，嵌入方无法覆盖（YouTube 等嵌入同样
          // 如此），播放器会自带「点击恢复音量」的一键恢复。
          src={`//player.bilibili.com/player.html?isOutside=true&aid=${VIDEO.aid}&bvid=${VIDEO.bvid}&cid=${VIDEO.cid}&p=1&autoplay=1&muted=0`}
          scrolling="no"
          frameBorder={0}
          allowFullScreen
          allow="autoplay; fullscreen"
          title={title}
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={playLabel}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={VIDEO.cover}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
          {/* 封面压暗一档：播放键与悬停反馈在亮封面上也分明 */}
          <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/40" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-black/45 text-white backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
              <Play className="ml-1 h-7 w-7" fill="currentColor" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
