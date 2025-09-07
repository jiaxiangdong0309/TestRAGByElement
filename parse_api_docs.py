#!/usr/bin/env python3
"""
HTML API文档解析器
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
            'response': {},
            'error_codes': []
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
    request_body_pattern = r'<h3>Request Body</h3>(.*?)(?=<h3>|$)'
    request_body_match = re.search(request_body_pattern, content, re.DOTALL)
    
    if request_body_match:
        request_body_content = request_body_match.group(1)
        
        # 提取参数列表
        param_pattern = r'<dd><code>([^<]+)</code></dd><dt class="sr-only">Type</dt><dd class="font-mono text-xs text-zinc-400 dark:text-zinc-500">([^<]+)</dd><dt class="sr-only">Description</dt><dd class="w-full flex-none.*?<p>([^<]+)</p>'
        param_matches = re.findall(param_pattern, request_body_content, re.DOTALL)
        
        for name, param_type, description in param_matches:
            parameters.append({
                'name': name.strip(),
                'type': param_type.strip(),
                'description': description.strip(),
                'required': False
            })
    
    return parameters

def extract_response(content: str) -> Dict[str, Any]:
    """提取响应信息"""
    response = {
        'format': '',
        'fields': []
    }
    
    # 查找Response部分
    response_pattern = r'<h3>Response</h3>(.*?)(?=<h3>|$)'
    response_match = re.search(response_pattern, content, re.DOTALL)
    
    if response_match:
        response_content = response_match.group(1)
        
        # 提取响应格式
        format_pattern = r'<p>当 <code>response_mode</code> 为 <code>([^<]+)</code> 时，返回 ([^<]+)</p>'
        format_match = re.search(format_pattern, response_content)
        if format_match:
            response['format'] = f"response_mode: {format_match.group(1)} -> {format_match.group(2)}"
    
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
    with open('/Users/mac/hewa/ruoyi-element-ai/API文档.md', 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"成功提取 {len(apis)} 个API接口，并生成Markdown文档")

def generate_markdown(api_categories: Dict[str, List[Dict[str, Any]]]) -> str:
    """生成Markdown文档"""
    markdown = """# Dify API 接口文档

## 概述

本文档描述了Dify聊天应用的API接口，支持会话持久化、文件上传、音频处理等功能。

### 基础信息

- **基础URL**: `http://dify-contest.hewa.cn/v1`
- **鉴权方式**: API-Key (在Header中添加 `Authorization: Bearer {API_KEY}`)
- **数据格式**: JSON

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权，API-Key无效 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |

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
                    required = "是" if param['required'] else "否"
                    markdown += f"| {param['name']} | {param['type']} | {required} | {param['description']} |\n"
                
                markdown += "\n"
            
            if api['response']:
                markdown += "#### 响应格式\n\n"
                if api['response']['format']:
                    markdown += f"{api['response']['format']}\n\n"
            
            markdown += "---\n\n"
    
    return markdown

if __name__ == "__main__":
    main()