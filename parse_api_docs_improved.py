#!/usr/bin/env python3
"""
改进的HTML API文档解析器
用于解析从Dify爬取的HTML API文档
"""

import re
import json
from typing import Dict, List, Any
import html

def extract_api_info(html_content: str) -> List[Dict[str, Any]]:
    """提取API接口信息"""
    
    # 找到所有API接口的锚点
    api_pattern = r'<span id="([^"]+)" class="relative -top-28"></span><div class="flex items-center gap-x-3"><span class="[^"]*">([^<]+)</span><span class="font-mono text-xs text-zinc-400">([^<]+)</span></div><h2 class="mt-2 scroll-mt-32"><a href="[^"]*" class="group text-inherit no-underline hover:text-inherit">([^<]+)</a></h2>'
    
    api_matches = re.findall(api_pattern, html_content)
    
    apis = []
    
    for api_id, method, path, name in api_matches:
        api_info = {
            'id': api_id,
            'method': method.strip(),
            'path': path.strip(),
            'name': name.strip(),
            'description': '',
            'parameters': [],
            'response': {
                'format': '',
                'fields': [],
                'sse_events': []
            },
            'examples': []
        }
        
        # 提取该API的详细内容
        start_idx = html_content.find(f'<span id="{api_id}" class="relative -top-28"></span>')
        if start_idx == -1:
            continue
            
        # 找到下一个API的开始位置
        next_api_pattern = r'<span id="[^"]+" class="relative -top-28"></span>'
        next_matches = list(re.finditer(next_api_pattern, html_content[start_idx + 1:]))
        
        if next_matches:
            end_idx = start_idx + 1 + next_matches[0].start()
        else:
            end_idx = len(html_content)
        
        api_content = html_content[start_idx:end_idx]
        
        # 提取描述
        desc_pattern = r'<p>([^<]+)</p>'
        desc_match = re.search(desc_pattern, api_content)
        if desc_match:
            api_info['description'] = desc_match.group(1).strip()
        
        # 提取请求参数
        api_info['parameters'] = extract_parameters(api_content)
        
        # 提取响应信息
        api_info['response'] = extract_response(api_content)
        
        apis.append(api_info)
    
    return apis

def extract_parameters(content: str) -> List[Dict[str, Any]]:
    """提取请求参数"""
    parameters = []
    
    # 查找Request Body部分
    request_body_pattern = r'<h3>Request Body</h3>(.*?)(?=<h3>|<hr>|$)'
    request_body_match = re.search(request_body_pattern, content, re.DOTALL)
    
    if request_body_match:
        request_body_content = request_body_match.group(1)
        
        # 提取参数列表 - 更精确的正则表达式
        param_pattern = r'<li class="m-0 px-0 py-4 first:pt-0 last:pb-0"><dl class="m-0 flex flex-wrap items-center gap-x-3 gap-y-2"><dt class="sr-only">Name</dt><dd><code>([^<]+)</code></dd><dt class="sr-only">Type</dt><dd class="font-mono text-xs text-zinc-400 dark:text-zinc-500">([^<]+)</dd><dt class="sr-only">Description</dt><dd class="w-full flex-none.*?<p>(.*?)</p>'
        param_matches = re.findall(param_pattern, request_body_content, re.DOTALL)
        
        for name, param_type, description in param_matches:
            # 清理描述中的HTML标签
            description = re.sub(r'<[^>]+>', '', description)
            description = description.strip()
            
            parameters.append({
                'name': name.strip(),
                'type': param_type.strip(),
                'description': description,
                'required': False
            })
    
    # 查询路径参数
    path_param_pattern = r'<h3>Path Parameters</h3>(.*?)(?=<h3>|<hr>|$)'
    path_param_match = re.search(path_param_pattern, content, re.DOTALL)
    
    if path_param_match:
        path_param_content = path_param_match.group(1)
        param_pattern = r'<dd><code>([^<]+)</code></dd><dt class="sr-only">Type</dt><dd class="font-mono text-xs text-zinc-400 dark:text-zinc-500">([^<]+)</dd><dt class="sr-only">Description</dt><dd class="w-full flex-none.*?<p>([^<]+)</p>'
        param_matches = re.findall(param_pattern, path_param_content, re.DOTALL)
        
        for name, param_type, description in param_matches:
            parameters.append({
                'name': name.strip(),
                'type': param_type.strip(),
                'description': description.strip(),
                'required': True,
                'in': 'path'
            })
    
    # 查询查询参数
    query_param_pattern = r'<h3>Query Parameters</h3>(.*?)(?=<h3>|<hr>|$)'
    query_param_match = re.search(query_param_pattern, content, re.DOTALL)
    
    if query_param_match:
        query_param_content = query_param_match.group(1)
        param_pattern = r'<dd><code>([^<]+)</code></dd><dt class="sr-only">Type</dt><dd class="font-mono text-xs text-zinc-400 dark:text-zinc-500">([^<]+)</dd><dt class="sr-only">Description</dt><dd class="w-full flex-none.*?<p>([^<]+)</p>'
        param_matches = re.findall(param_pattern, query_param_content, re.DOTALL)
        
        for name, param_type, description in param_matches:
            parameters.append({
                'name': name.strip(),
                'type': param_type.strip(),
                'description': description.strip(),
                'required': False,
                'in': 'query'
            })
    
    return parameters

def extract_response(content: str) -> Dict[str, Any]:
    """提取响应信息"""
    response = {
        'format': '',
        'fields': [],
        'sse_events': []
    }
    
    # 查找Response部分
    response_pattern = r'<h3>Response</h3>(.*?)(?=<h3>|<hr>|$)'
    response_match = re.search(response_pattern, content, re.DOTALL)
    
    if response_match:
        response_content = response_match.group(1)
        
        # 提取响应格式
        format_pattern = r'当 <code>response_mode</code> 为 <code>([^<]+)</code> 时，返回 ([^<]+)'
        format_match = re.search(format_pattern, response_content)
        if format_match:
            response['format'] = f"response_mode: {format_match.group(1)} -> {format_match.group(2)}"
        
        # 提取SSE事件
        sse_pattern = r'<li><code>event: ([^<]+)</code>(.*?)(?=</li>|<li><code>event:|$)'
        sse_matches = re.findall(sse_pattern, response_content, re.DOTALL)
        
        for event_name, event_content in sse_matches:
            # 提取事件字段
            fields = []
            field_pattern = r'<li><code>([^<]+)</code> \(([^)]+)\)([^<]*)</li>'
            field_matches = re.findall(field_pattern, event_content)
            
            for field_name, field_type, field_desc in field_matches:
                fields.append({
                    'name': field_name.strip(),
                    'type': field_type.strip(),
                    'description': field_desc.strip()
                })
            
            response['sse_events'].append({
                'event': event_name.strip(),
                'description': re.sub(r'<[^>]+>', '', event_content.split('</li>')[0] if '</li>' in event_content else event_content).strip(),
                'fields': fields
            })
    
    return response

def main():
    """主函数"""
    # 读取HTML文件
    with open('/Users/mac/hewa/ruoyi-element-ai/API_使用文档.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # 提取API信息
    apis = extract_api_info(html_content)
    
    # 按功能模块分类
    api_categories = {
        '聊天对话': [],
        '文件管理': [],
        '会话管理': [],
        '音频处理': [],
        '应用信息': [],
        '标注管理': []
    }
    
    for api in apis:
        if 'chat' in api['path'] or 'message' in api['path']:
            api_categories['聊天对话'].append(api)
        elif 'file' in api['path']:
            api_categories['文件管理'].append(api)
        elif 'conversation' in api['path']:
            api_categories['会话管理'].append(api)
        elif 'audio' in api['path']:
            api_categories['音频处理'].append(api)
        elif 'annotation' in api['path']:
            api_categories['标注管理'].append(api)
        else:
            api_categories['应用信息'].append(api)
    
    # 生成Markdown文档
    markdown_content = generate_markdown(api_categories)
    
    # 保存Markdown文档
    with open('/Users/mac/hewa/ruoyi-element-ai/API文档_详细版.md', 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"成功提取 {len(apis)} 个API接口，并生成详细版Markdown文档")

def generate_markdown(api_categories: Dict[str, List[Dict[str, Any]]]) -> str:
    """生成Markdown文档"""
    markdown = """# Dify API 接口文档

## 概述

本文档描述了Dify聊天应用的API接口，支持会话持久化、文件上传、音频处理等功能。

### 基础信息

- **基础URL**: `http://dify-contest.hewa.cn/v1`
- **鉴权方式**: API-Key (在Header中添加 `Authorization: Bearer {API_KEY}`)
- **数据格式**: JSON
- **支持流式响应**: 是 (SSE)

### 请求头

| 头部 | 值 | 说明 |
|------|-----|------|
| Authorization | Bearer {API_KEY} | API密钥认证 |
| Content-Type | application/json | 请求内容格式 |

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权，API-Key无效 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |

### SSE流式响应事件类型

| 事件类型 | 说明 |
|----------|------|
| message | 消息内容块 |
| message_file | 文件事件 |
| message_end | 消息结束 |
| tts_message | TTS音频流 |
| tts_message_end | TTS音频流结束 |
| message_replace | 消息内容替换 |
| workflow_started | 工作流开始 |
| node_started | 节点开始执行 |
| node_finished | 节点执行结束 |
| workflow_finished | 工作流执行结束 |
| error | 错误事件 |

"""

    for category, apis in api_categories.items():
        if not apis:
            continue
            
        markdown += f"## {category}\n\n"
        
        for api in apis:
            markdown += f"### {api['name']}\n\n"
            markdown += f"**接口地址**: `{api['method']} {api['path']}`\n\n"
            markdown += f"**描述**: {api['description']}\n\n"
            
            if api['parameters']:
                markdown += "#### 请求参数\n\n"
                markdown += "| 参数名 | 类型 | 必填 | 说明 |\n"
                markdown += "|--------|------|------|------|\n"
                
                for param in api['parameters']:
                    required = "是" if param.get('required', False) else "否"
                    location = param.get('in', 'body')
                    location_desc = f" ({location})" if location != 'body' else ""
                    markdown += f"| {param['name']} | {param['type']}{location_desc} | {required} | {param['description']} |\n"
                
                markdown += "\n"
            
            if api['response']['format']:
                markdown += "#### 响应格式\n\n"
                markdown += f"{api['response']['format']}\n\n"
            
            if api['response']['sse_events']:
                markdown += "#### SSE流式响应事件\n\n"
                
                for event in api['response']['sse_events']:
                    markdown += f"**{event['event']}**\n\n"
                    markdown += f"{event['description']}\n\n"
                    
                    if event['fields']:
                        markdown += "| 字段名 | 类型 | 说明 |\n"
                        markdown += "|--------|------|------|\n"
                        
                        for field in event['fields']:
                            markdown += f"| {field['name']} | {field['type']} | {field['description']} |\n"
                        
                        markdown += "\n"
            
            markdown += "---\n\n"
    
    return markdown

if __name__ == "__main__":
    main()