#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import sqlite3
import os
from datetime import datetime
import glob
import re

def analyze_excel_structure():
    """تحليل بنية ملف Excel لفهم تنسيق البيانات"""
    
    excel_files = glob.glob("attached_assets/*ملف الزبائن*.xlsx")
    
    for file_path in excel_files:
        print(f"\n📊 تحليل الملف: {file_path}")
        
        try:
            # قراءة الملف مع عرض البيانات الخام
            df = pd.read_excel(file_path, sheet_name=0, header=None)
            
            print(f"حجم البيانات: {df.shape[0]} صف × {df.shape[1]} عمود")
            print("\nأول 10 صفوف:")
            print(df.head(10).to_string())
            
            print("\nآخر 10 صفوف:")
            print(df.tail(10).to_string())
            
            # البحث عن الأسماء (الأعمدة التي تحتوي على نص عربي)
            names_found = []
            for idx, row in df.iterrows():
                if idx > 10:  # تجاهل الصفوف العلوية (العناوين)
                    for col in df.columns:
                        value = str(row[col]).strip()
                        if value and value != 'nan' and value != 'NaN':
                            # التحقق من وجود أحرف عربية أو أرقام
                            if re.search(r'[\u0600-\u06FF]', value) or value.replace(' ', '').replace('-', '').isalnum():
                                if len(value) > 2 and value not in names_found:
                                    names_found.append(value)
            
            print(f"\nوجدت {len(names_found)} اسم/معرف محتمل")
            if names_found:
                print("أول 20 اسم:")
                for i, name in enumerate(names_found[:20], 1):
                    print(f"{i}. {name}")
            
            break  # تحليل ملف واحد فقط للبداية
            
        except Exception as e:
            print(f"خطأ في تحليل الملف: {e}")

def restore_customers_smart():
    """استعادة ذكية لبيانات الزبائن"""
    
    excel_files = glob.glob("attached_assets/*ملف الزبائن*.xlsx")
    all_customers = []
    
    for file_path in excel_files:
        print(f"\n📂 معالجة الملف: {file_path}")
        
        try:
            # قراءة الملف بدون headers
            df = pd.read_excel(file_path, sheet_name=0, header=None)
            
            # البحث عن البيانات الفعلية (تجاهل الصفوف الفارغة والعناوين)
            for idx, row in df.iterrows():
                if idx < 5:  # تجاهل أول 5 صفوف (عناوين)
                    continue
                    
                # البحث عن أول قيمة غير فارغة تبدو كاسم
                customer_name = None
                customer_phone = None
                
                for col in df.columns:
                    value = str(row[col]).strip()
                    if value and value != 'nan' and value != 'NaN' and len(value) > 1:
                        # إذا كان يحتوي على أحرف عربية، فهو على الأرجح اسم
                        if re.search(r'[\u0600-\u06FF]', value) and not customer_name:
                            customer_name = value
                        # إذا كان رقماً، فهو على الأرجح رقم هاتف
                        elif value.replace('-', '').replace(' ', '').isdigit() and len(value) >= 9 and not customer_phone:
                            customer_phone = value
                
                # إضافة الزبون إذا وجدنا اسماً
                if customer_name and len(customer_name) > 2:
                    customer_data = {
                        'name': customer_name,
                        'phone': customer_phone or '',
                        'notes': f'مستورد من Excel - {os.path.basename(file_path)}'
                    }
                    all_customers.append(customer_data)
        
        except Exception as e:
            print(f"خطأ في معالجة الملف: {e}")
    
    print(f"\n📊 تم استخراج {len(all_customers)} زبون من جميع الملفات")
    
    # إزالة المكررات
    unique_customers = {}
    for customer in all_customers:
        name = customer['name']
        if name not in unique_customers:
            unique_customers[name] = customer
    
    final_customers = list(unique_customers.values())
    print(f"📊 عدد الزبائن النهائي بعد إزالة المكررات: {len(final_customers)}")
    
    # عرض عينة
    if final_customers:
        print("\n👥 عينة من الزبائن المستخرجين:")
        for i, customer in enumerate(final_customers[:10], 1):
            print(f"{i}. {customer['name']} - {customer.get('phone', 'لا يوجد هاتف')}")
    
    return final_customers

def save_to_database(customers):
    """حفظ الزبائن في قاعدة البيانات"""
    
    try:
        conn = sqlite3.connect('v-power-tuning.db')
        cursor = conn.cursor()
        
        # التحقق من بنية الجدول
        cursor.execute("PRAGMA table_info(customers)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"أعمدة جدول customers: {columns}")
        
        # حذف البيانات السابقة
        cursor.execute("DELETE FROM customers")
        print("تم حذف البيانات السابقة")
        
        # إدراج الزبائن الجدد
        inserted_count = 0
        for customer in customers:
            try:
                cursor.execute("""
                    INSERT INTO customers (name, phone_number, notes, customer_status, is_favorite, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    customer['name'],
                    customer.get('phone', ''),
                    customer.get('notes', ''),
                    'A',  # customer_status
                    False,  # is_favorite 
                    datetime.now().isoformat()
                ))
                inserted_count += 1
            except Exception as e:
                print(f"خطأ في إدراج الزبون '{customer['name']}': {e}")
        
        conn.commit()
        
        # التحقق من النتائج
        cursor.execute("SELECT COUNT(*) FROM customers")
        total = cursor.fetchone()[0]
        
        print(f"\n✅ تم إدراج {inserted_count} زبون بنجاح")
        print(f"📊 إجمالي الزبائن في قاعدة البيانات: {total}")
        
        # عرض عينة من النتائج
        cursor.execute("SELECT name, phone_number FROM customers LIMIT 10")
        sample = cursor.fetchall()
        print("\n👥 عينة من الزبائن في قاعدة البيانات:")
        for i, (name, phone) in enumerate(sample, 1):
            print(f"{i}. {name} - {phone}")
        
        conn.close()
        return inserted_count
        
    except Exception as e:
        print(f"❌ خطأ في حفظ البيانات: {e}")
        return 0

if __name__ == "__main__":
    print("🔍 تحليل بنية ملفات Excel...")
    analyze_excel_structure()
    
    print("\n" + "="*50)
    print("🔄 بدء استعادة بيانات الزبائن...")
    customers = restore_customers_smart()
    
    if customers:
        save_to_database(customers)
    else:
        print("❌ لم يتم العثور على أي زبائن!")
    
    print("\n✅ تم الانتهاء من المعالجة!")