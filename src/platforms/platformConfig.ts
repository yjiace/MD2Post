import type { PlatformConfig, PlatformType } from '../types';

export const PLATFORMS: Record<PlatformType, PlatformConfig> = {
  wechat: {
    id: 'wechat',
    name: '微信公众号',
    badge: '微信',
    defaultCopyMode: 'rich-text',
    supportExternalLinks: false,
    convertLinksToFootnotes: true,
    tableStrategy: 'inline-table',
    codeBlockStrategy: 'inline-highlight',
    tipsStrategy: 'styled-callout'
  },
  zhihu: {
    id: 'zhihu',
    name: '知乎专栏',
    badge: '知乎',
    defaultCopyMode: 'rich-text',
    supportExternalLinks: true,
    convertLinksToFootnotes: false,
    tableStrategy: 'pure-table',
    codeBlockStrategy: 'inline-highlight',
    tipsStrategy: 'styled-callout'
  },
  toutiao: {
    id: 'toutiao',
    name: '头条号',
    badge: '头条',
    defaultCopyMode: 'rich-text',
    supportExternalLinks: true,
    convertLinksToFootnotes: false,
    tableStrategy: 'inline-table',
    codeBlockStrategy: 'clean-mono',
    tipsStrategy: 'styled-callout'
  },
  juejin: {
    id: 'juejin',
    name: '掘金社区',
    badge: '掘金',
    defaultCopyMode: 'markdown',
    supportExternalLinks: true,
    convertLinksToFootnotes: false,
    tableStrategy: 'markdown-table',
    codeBlockStrategy: 'markdown-code',
    tipsStrategy: 'markdown-quote'
  },
  csdn: {
    id: 'csdn',
    name: 'CSDN 博客',
    badge: 'CSDN',
    defaultCopyMode: 'rich-text',
    supportExternalLinks: true,
    convertLinksToFootnotes: false,
    tableStrategy: 'pure-table',
    codeBlockStrategy: 'inline-highlight',
    tipsStrategy: 'styled-callout'
  },
  universal: {
    id: 'universal',
    name: '通用富文本',
    badge: '通用',
    defaultCopyMode: 'rich-text',
    supportExternalLinks: true,
    convertLinksToFootnotes: false,
    tableStrategy: 'inline-table',
    codeBlockStrategy: 'inline-highlight',
    tipsStrategy: 'styled-callout'
  }
};
