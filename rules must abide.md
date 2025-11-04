# 6A5S编程规范文档
## AI编程助手应遵守的代码质量标准

---

## 📋 文档概述

本文档定义了AI编程助手在生成、审查和优化代码时应遵循的**6A5S原则**。这些原则旨在确保代码质量、可维护性和专业性，为用户提供生产级别的代码输出。

---

## 🎯 6A原则 (Six A Principles)

### 1. **Accuracy (准确性)**

**定义**: 代码必须准确实现用户需求，逻辑正确，无明显错误。

**实施要求**:
- ✅ 仔细理解用户需求，必要时进行需求澄清
- ✅ 确保算法逻辑正确，边界条件处理完善
- ✅ 避免常见的编程错误（如off-by-one、空指针等）
- ✅ 数据类型使用准确，避免隐式转换导致的问题
- ✅ API调用方式正确，参数传递准确

**示例**:
```python
# ❌ 错误示例 - 边界条件处理不当
def get_element(arr, index):
    return arr[index]  # 可能越界

# ✅ 正确示例 - 准确处理边界
def get_element(arr, index):
    if not arr or index < 0 or index >= len(arr):
        return None
    return arr[index]
```

---

### 2. **Adaptability (适应性)**

**定义**: 代码应具有良好的扩展性和灵活性，能适应需求变化。

**实施要求**:
- ✅ 使用配置参数而非硬编码
- ✅ 采用合适的设计模式（策略、工厂等）
- ✅ 接口设计考虑未来扩展
- ✅ 避免过度耦合，保持模块独立性
- ✅ 支持依赖注入和控制反转

**示例**:
```python
# ❌ 硬编码，难以扩展
def send_notification(message):
    # 只支持邮件
    send_email(message)

# ✅ 适应性强，易于扩展
class NotificationService:
    def __init__(self, sender):
        self.sender = sender  # 可以是EmailSender, SMSSender等
    
    def send(self, message):
        self.sender.send(message)
```

---

### 3. **Availability (可用性)**

**定义**: 代码应具备健壮的错误处理和容错机制，确保系统稳定运行。

**实施要求**:
- ✅ 实现完善的异常处理机制
- ✅ 提供有意义的错误信息
- ✅ 实现重试机制（适用于网络请求等）
- ✅ 添加日志记录关键操作
- ✅ 优雅降级，避免系统崩溃

**示例**:
```python
# ❌ 缺乏错误处理
def fetch_data(url):
    response = requests.get(url)
    return response.json()

# ✅ 完善的错误处理
def fetch_data(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.Timeout:
            logger.warning(f"Timeout on attempt {attempt + 1}")
        except requests.RequestException as e:
            logger.error(f"Request failed: {e}")
            if attempt == max_retries - 1:
                raise
    return None
```

---

### 4. **Auditability (可审计性)**

**定义**: 代码应具备良好的日志记录和追踪能力，便于问题排查和审计。

**实施要求**:
- ✅ 记录关键操作和状态变更
- ✅ 使用结构化日志格式
- ✅ 包含必要的上下文信息（用户ID、请求ID等）
- ✅ 区分日志级别（DEBUG、INFO、WARNING、ERROR）
- ✅ 敏感信息脱敏处理

**示例**:
```python
import logging

# ✅ 良好的审计日志
def process_payment(user_id, amount, payment_method):
    logger.info(f"Payment initiated", extra={
        "user_id": user_id,
        "amount": amount,
        "payment_method": payment_method,
        "timestamp": datetime.now().isoformat()
    })
    
    try:
        result = payment_gateway.charge(amount, payment_method)
        logger.info(f"Payment successful", extra={
            "user_id": user_id,
            "transaction_id": result.transaction_id
        })
        return result
    except PaymentError as e:
        logger.error(f"Payment failed", extra={
            "user_id": user_id,
            "error": str(e)
        })
        raise
```

---

### 5. **Accessibility (可访问性)**

**定义**: 代码应易于理解、使用和维护，具有良好的文档和注释。

**实施要求**:
- ✅ 提供清晰的函数/类文档字符串
- ✅ 复杂逻辑添加注释说明
- ✅ 使用有意义的变量和函数命名
- ✅ 提供使用示例
- ✅ 说明参数类型和返回值

**示例**:
```python
def calculate_discount(price: float, customer_tier: str, 
                       promo_code: Optional[str] = None) -> float:
    """
    计算商品折扣后的价格
    
    Args:
        price: 商品原价，必须为正数
        customer_tier: 客户等级 ('bronze', 'silver', 'gold', 'platinum')
        promo_code: 可选的促销代码
    
    Returns:
        折扣后的最终价格
    
    Raises:
        ValueError: 当价格为负数或客户等级无效时
    
    Example:
        >>> calculate_discount(100.0, 'gold', 'SAVE10')
        81.0
    """
    if price < 0:
        raise ValueError("Price must be non-negative")
    
    # 应用会员等级折扣
    tier_discounts = {
        'bronze': 0.05,
        'silver': 0.10,
        'gold': 0.15,
        'platinum': 0.20
    }
    
    discount = tier_discounts.get(customer_tier, 0)
    discounted_price = price * (1 - discount)
    
    # 应用促销代码
    if promo_code:
        promo_discount = get_promo_discount(promo_code)
        discounted_price *= (1 - promo_discount)
    
    return round(discounted_price, 2)
```

---

### 6. **Assurance (保障性)**

**定义**: 代码应包含适当的测试和验证机制，确保质量和安全性。

**实施要求**:
- ✅ 提供单元测试示例
- ✅ 验证输入参数的合法性
- ✅ 实施安全编码实践（防注入、防XSS等）
- ✅ 处理敏感数据时使用加密
- ✅ 遵循最小权限原则

**示例**:
```python
import re
from typing import Optional

def sanitize_user_input(user_input: str) -> str:
    """清理用户输入，防止注入攻击"""
    # 移除潜在危险字符
    sanitized = re.sub(r'[<>\"\'%;()&+]', '', user_input)
    return sanitized.strip()

def validate_email(email: str) -> bool:
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

# 单元测试示例
def test_validate_email():
    assert validate_email("user@example.com") == True
    assert validate_email("invalid.email") == False
    assert validate_email("user@") == False
```

---

## 🧹 5S原则 (Five S Principles)

### 1. **Sort (整理)**

**定义**: 代码结构清晰，文件和模块组织合理。

**实施要求**:
- ✅ 按功能模块组织代码
- ✅ 一个文件/类只负责一个职责
- ✅ 删除无用的代码和注释
- ✅ 合理的目录结构
- ✅ 导入语句分组排序

**示例**:
```python
# ✅ 良好的导入组织
# 标准库
import os
import sys
from datetime import datetime

# 第三方库
import numpy as np
import pandas as pd
from flask import Flask, request

# 本地模块
from .models import User
from .utils import validate_input
from .config import settings
```

---

### 2. **Set in Order (整顿)**

**定义**: 代码遵循统一的编码规范和风格指南。

**实施要求**:
- ✅ 遵循语言特定的风格指南（PEP 8、Google Style等）
- ✅ 统一的命名约定
- ✅ 一致的缩进和格式
- ✅ 使用代码格式化工具（Black、Prettier等）
- ✅ 统一的错误处理模式

**示例**:
```python
# ✅ 遵循PEP 8规范
class UserManager:
    """用户管理类"""
    
    MAX_LOGIN_ATTEMPTS = 3  # 常量大写
    
    def __init__(self, database_connection):
        self.db = database_connection
        self._cache = {}  # 私有属性下划线前缀
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """获取用户信息 - 方法名小写下划线分隔"""
        if user_id in self._cache:
            return self._cache[user_id]
        
        user = self.db.query(User).filter_by(id=user_id).first()
        if user:
            self._cache[user_id] = user
        return user
```

---

### 3. **Shine (清扫)**

**定义**: 代码简洁清晰，无冗余和重复。

**实施要求**:
- ✅ 遵循DRY原则（Don't Repeat Yourself）
- ✅ 提取重复代码为函数/方法
- ✅ 避免过长的函数（建议<50行）
- ✅ 移除调试代码和无用注释
- ✅ 简化复杂的条件判断

**示例**:
```python
# ❌ 重复代码
def calculate_area_rectangle(width, height):
    return width * height

def calculate_area_square(side):
    return side * side

def calculate_area_triangle(base, height):
    return 0.5 * base * height

# ✅ 消除重复，使用策略模式
class Shape:
    def calculate_area(self):
        raise NotImplementedError

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def calculate_area(self):
        return self.width * self.height

class Triangle(Shape):
    def __init__(self, base, height):
        self.base = base
        self.height = height
    
    def calculate_area(self):
        return 0.5 * self.base * self.height
```

---

### 4. **Standardize (标准化)**

**定义**: 使用标准化的模式和最佳实践。

**实施要求**:
- ✅ 使用成熟的设计模式
- ✅ 遵循SOLID原则
- ✅ 使用标准库而非重复造轮子
- ✅ API设计遵循RESTful或GraphQL标准
- ✅ 数据库操作使用ORM

**示例**:
```python
# ✅ 使用单例模式标准化配置管理
class ConfigManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_config()
        return cls._instance
    
    def _load_config(self):
        # 加载配置逻辑
        pass

# ✅ 使用上下文管理器标准化资源管理
from contextlib import contextmanager

@contextmanager
def database_connection(db_url):
    conn = create_connection(db_url)
    try:
        yield conn
    finally:
        conn.close()

# 使用
with database_connection("postgresql://...") as conn:
    conn.execute("SELECT * FROM users")
```

---

### 5. **Sustain (维持)**

**定义**: 建立可持续的代码质量保障机制。

**实施要求**:
- ✅ 提供代码审查建议
- ✅ 建议使用CI/CD流程
- ✅ 推荐代码质量检查工具
- ✅ 提供性能优化建议
- ✅ 考虑技术债务管理

**示例**:
```yaml
# ✅ CI/CD配置示例 (.github/workflows/ci.yml)
name: Code Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          pip install pylint black pytest pytest-cov
      
      - name: Code formatting check
        run: black --check .
      
      - name: Linting
        run: pylint src/
      
      - name: Run tests
        run: pytest --cov=src tests/
      
      - name: Coverage report
        run: pytest --cov=src --cov-report=html
```

---

## 📊 实施检查清单

在生成代码时，AI应自我检查以下项目：

### 代码生成前
- [ ] 是否完全理解用户需求？
- [ ] 是否选择了合适的技术栈？
- [ ] 是否考虑了性能和安全性？

### 代码生成中
- [ ] 逻辑是否准确无误？
- [ ] 是否添加了适当的注释？
- [ ] 是否遵循了编码规范？
- [ ] 是否处理了异常情况？

### 代码生成后
- [ ] 是否提供了使用说明？
- [ ] 是否建议了测试方案？
- [ ] 是否说明了潜在的改进点？
- [ ] 是否考虑了可维护性？

---

## 🎓 总结

**6A5S原则**是AI编程助手应遵循的核心质量标准：

**6A** 确保代码的**功能质量**：
- 准确、适应、可用、可审计、可访问、有保障

**5S** 确保代码的**结构质量**：
- 整理、整顿、清扫、标准化、维持

遵循这些原则，AI助手能够生成**生产级别、可维护、高质量**的代码，为用户提供专业的编程支持。

---

## 📚 参考资源

- **编码规范**: PEP 8 (Python), Google Style Guides
- **设计原则**: SOLID, DRY, KISS, YAGNI
- **设计模式**: Gang of Four Design Patterns
- **代码质量**: Clean Code (Robert C. Martin)
- **测试**: Test-Driven Development (Kent Beck)

---

*本文档应作为AI编程助手的核心指导原则，在每次代码生成时参考执行。*