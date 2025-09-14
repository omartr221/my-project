#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import sqlite3
import os
from datetime import datetime
import glob
import re

def check_database_structure():
    """التحقق من بنية قاعدة البيانات الحقيقية"""
    try:
        conn = sqlite3.connect('v-power-tuning.db')
        cursor = conn.cursor()
        
        # التحقق من بنية جدول customers
        cursor.execute("PRAGMA table_info(customers)")
        columns = cursor.fetchall()
        
        print("📊 بنية جدول customers الحقيقية:")
        column_names = []
        for col in columns:
            column_names.append(col[1])
            print(f"  - {col[1]} ({col[2]})")
        
        conn.close()
        return column_names
        
    except Exception as e:
        print(f"❌ خطأ في فحص قاعدة البيانات: {e}")
        return []

def restore_customers_final():
    """استعادة نهائية للزبائن مع الأعمدة الصحيحة"""
    
    # فحص بنية قاعدة البيانات أولاً
    db_columns = check_database_structure()
    
    if not db_columns:
        print("❌ لا يمكن الوصول لقاعدة البيانات")
        return
    
    # قراءة البيانات من Excel
    excel_files = glob.glob("attached_assets/*ملف الزبائن*.xlsx")
    all_customers = []
    
    for file_path in excel_files:
        print(f"\n📂 معالجة: {os.path.basename(file_path)}")
        
        try:
            df = pd.read_excel(file_path, sheet_name=0, header=None)
            
            # تجاهل أول 5 صفوف (عناوين)
            for idx, row in df.iterrows():
                if idx < 5:
                    continue
                    
                # البحث عن الاسم (أول نص عربي في الصف)
                customer_name = None
                customer_phone = None
                
                for col in df.columns:
                    value = str(row[col]).strip()
                    if value and value != 'nan' and value != 'NaN' and len(value) > 1:
                        # اسم (نص عربي)
                        if re.search(r'[\u0600-\u06FF]', value) and not customer_name:
                            if len(value) > 2 and not value.isdigit():
                                customer_name = value
                        # رقم هاتف (رقم)
                        elif value.replace('-', '').replace(' ', '').isdigit() and len(value) >= 9:
                            if not customer_phone:
                                customer_phone = value
                
                if customer_name and len(customer_name) > 2:
                    all_customers.append({
                        'name': customer_name,
                        'phone': customer_phone or ''
                    })
        
        except Exception as e:
            print(f"❌ خطأ في معالجة {file_path}: {e}")
    
    print(f"\n📊 استُخرج {len(all_customers)} زبون")
    
    # إزالة المكررات
    unique_customers = {}
    for customer in all_customers:
        name = customer['name']
        if name not in unique_customers:
            unique_customers[name] = customer
    
    final_customers = list(unique_customers.values())
    print(f"📊 زبائن فريدين: {len(final_customers)}")
    
    # حفظ في قاعدة البيانات
    save_customers_correctly(final_customers, db_columns)
    
    return final_customers

def save_customers_correctly(customers, db_columns):
    """حفظ الزبائن بالأعمدة الصحيحة"""
    
    try:
        conn = sqlite3.connect('v-power-tuning.db')
        cursor = conn.cursor()
        
        # حذف البيانات السابقة
        cursor.execute("DELETE FROM customers")
        print("🗑️ تم حذف البيانات السابقة")
        
        # تحديد الأعمدة المتاحة
        available_columns = [col.lower() for col in db_columns]
        print(f"الأعمدة المتاحة: {available_columns}")
        
        # إدراج الزبائن
        inserted_count = 0
        
        for customer in customers:
            try:
                # تحديد القيم حسب الأعمدة المتاحة
                values = []
                columns_to_insert = []
                
                # اسم الزبون
                if 'name' in available_columns:
                    columns_to_insert.append('name')
                    values.append(customer['name'])
                
                # رقم الهاتف
                phone_col = None
                for col in ['phone_number', 'phone', 'phoneNumber']:
                    if col.lower() in available_columns:
                        phone_col = col
                        break
                
                if phone_col:
                    columns_to_insert.append(phone_col)
                    values.append(customer.get('phone', ''))
                
                # الملاحظات
                notes_col = None
                for col in ['notes', 'note']:
                    if col.lower() in available_columns:
                        notes_col = col
                        break
                
                if notes_col:
                    columns_to_insert.append(notes_col)
                    values.append('مستورد من Excel')
                
                # تاريخ الإنشاء
                created_col = None
                for col in ['created_at', 'createdAt', 'created']:
                    if col.lower() in available_columns:
                        created_col = col
                        break
                
                if created_col:
                    columns_to_insert.append(created_col)
                    values.append(datetime.now().isoformat())
                
                # حالة الزبون
                status_col = None
                for col in ['customer_status', 'customerStatus', 'status']:
                    if col.lower() in available_columns:
                        status_col = col
                        break
                
                if status_col:
                    columns_to_insert.append(status_col)
                    values.append('A')
                
                # المفضلة
                favorite_col = None
                for col in ['is_favorite', 'isFavorite', 'favorite']:
                    if col.lower() in available_columns:
                        favorite_col = col
                        break
                
                if favorite_col:
                    columns_to_insert.append(favorite_col)
                    values.append(0)
                
                # إنشاء SQL للإدراج
                if columns_to_insert:
                    placeholders = ', '.join(['?' for _ in values])
                    columns_str = ', '.join(columns_to_insert)
                    
                    sql = f"INSERT INTO customers ({columns_str}) VALUES ({placeholders})"
                    cursor.execute(sql, values)
                    inserted_count += 1
                
            except Exception as e:
                print(f"❌ خطأ في إدراج '{customer['name'][:30]}...': {e}")
        
        conn.commit()
        
        # التحقق من النتائج
        cursor.execute("SELECT COUNT(*) FROM customers")
        total = cursor.fetchone()[0]
        
        print(f"\n✅ تم إدراج {inserted_count} زبون بنجاح!")
        print(f"📊 إجمالي الزبائن: {total}")
        
        # عرض عينة
        cursor.execute(f"SELECT * FROM customers LIMIT 5")
        sample = cursor.fetchall()
        print("\n👥 عينة من الزبائن:")
        for i, row in enumerate(sample, 1):
            print(f"{i}. {row}")
        
        conn.close()
        return inserted_count
        
    except Exception as e:
        print(f"❌ خطأ في حفظ البيانات: {e}")
        return 0

if __name__ == "__main__":
    print("🚀 بدء الاستعادة النهائية للزبائن...")
    customers = restore_customers_final()
    print("\n✅ تم الانتهاء!")