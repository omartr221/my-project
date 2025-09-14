#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import sqlite3
import os
from datetime import datetime
import glob

def restore_customers_from_excel():
    """استعادة بيانات الزبائن من ملفات Excel"""
    
    # البحث عن ملفات Excel
    excel_files = glob.glob("attached_assets/*ملف الزبائن*.xlsx")
    print(f"وجدت {len(excel_files)} ملف Excel:")
    
    all_customers = []
    
    for file_path in excel_files:
        print(f"\nقراءة الملف: {file_path}")
        
        try:
            # قراءة ملف Excel
            df = pd.read_excel(file_path, sheet_name=None)  # قراءة جميع الأوراق
            
            for sheet_name, sheet_data in df.items():
                print(f"  - ورقة العمل: {sheet_name}")
                print(f"  - عدد الصفوف: {len(sheet_data)}")
                print(f"  - الأعمدة: {list(sheet_data.columns)}")
                
                # تنظيف البيانات وإزالة الصفوف الفارغة
                sheet_data = sheet_data.dropna(how='all')
                
                # إضافة البيانات إلى القائمة
                for index, row in sheet_data.iterrows():
                    customer_data = {}
                    
                    # محاولة تحديد أعمدة الاسم ورقم الهاتف
                    for col in sheet_data.columns:
                        col_lower = str(col).lower()
                        if any(keyword in col_lower for keyword in ['اسم', 'name', 'الاسم']):
                            customer_data['name'] = str(row[col]).strip() if pd.notna(row[col]) else None
                        elif any(keyword in col_lower for keyword in ['هاتف', 'phone', 'تليفون', 'موبايل']):
                            customer_data['phone'] = str(row[col]).strip() if pd.notna(row[col]) else None
                        elif any(keyword in col_lower for keyword in ['عنوان', 'address', 'العنوان']):
                            customer_data['address'] = str(row[col]).strip() if pd.notna(row[col]) else None
                    
                    # إذا لم نجد عمود اسم محدد، نستخدم العمود الأول
                    if 'name' not in customer_data or not customer_data['name']:
                        first_col = sheet_data.columns[0]
                        customer_data['name'] = str(row[first_col]).strip() if pd.notna(row[first_col]) else None
                    
                    # إذا لم نجد عمود هاتف محدد، نستخدم العمود الثاني إن وجد
                    if 'phone' not in customer_data and len(sheet_data.columns) > 1:
                        second_col = sheet_data.columns[1]
                        customer_data['phone'] = str(row[second_col]).strip() if pd.notna(row[second_col]) else None
                    
                    # التحقق من صحة البيانات
                    if customer_data.get('name') and customer_data['name'] not in ['nan', 'NaN', '', 'None']:
                        # تنظيف رقم الهاتف
                        if customer_data.get('phone'):
                            phone = customer_data['phone']
                            if phone in ['nan', 'NaN', '', 'None']:
                                customer_data['phone'] = None
                            else:
                                # إزالة المسافات والرموز غير المرغوب فيها
                                phone = ''.join(filter(str.isdigit, phone))
                                if len(phone) >= 9:  # رقم هاتف صالح
                                    customer_data['phone'] = phone
                                else:
                                    customer_data['phone'] = None
                        
                        all_customers.append(customer_data)
        
        except Exception as e:
            print(f"خطأ في قراءة الملف {file_path}: {e}")
    
    print(f"\nتم استخراج {len(all_customers)} زبون من جميع الملفات")
    
    # إزالة المكررات بناءً على الاسم
    unique_customers = {}
    for customer in all_customers:
        name = customer['name']
        if name not in unique_customers:
            unique_customers[name] = customer
        elif customer.get('phone') and not unique_customers[name].get('phone'):
            # إذا كان لدينا رقم هاتف جديد، نحدث البيانات
            unique_customers[name].update(customer)
    
    final_customers = list(unique_customers.values())
    print(f"عدد الزبائن النهائي بعد إزالة المكررات: {len(final_customers)}")
    
    # حفظ البيانات في قاعدة البيانات
    if final_customers:
        save_customers_to_db(final_customers)
    
    return final_customers

def save_customers_to_db(customers):
    """حفظ الزبائن في قاعدة البيانات SQLite"""
    
    try:
        conn = sqlite3.connect('v-power-tuning.db')
        cursor = conn.cursor()
        
        # حذف الزبائن الموجودين سابقاً لتجنب المكررات
        cursor.execute("DELETE FROM customers")
        print("تم حذف الزبائن السابقين")
        
        # إدراج الزبائن الجدد
        inserted_count = 0
        for customer in customers:
            try:
                cursor.execute("""
                    INSERT INTO customers (name, phone_number, address, notes, created_at, customer_status, is_favorite)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    customer['name'],
                    customer.get('phone') or '',
                    customer.get('address') or '',
                    '',  # notes
                    datetime.now().isoformat(),
                    'A',  # active status
                    0     # not favorite
                ))
                inserted_count += 1
            except Exception as e:
                print(f"خطأ في إدراج زبون {customer['name']}: {e}")
        
        conn.commit()
        print(f"تم إدراج {inserted_count} زبون بنجاح في قاعدة البيانات")
        
        # التحقق من النتائج
        cursor.execute("SELECT COUNT(*) FROM customers")
        total_count = cursor.fetchone()[0]
        print(f"إجمالي الزبائن في قاعدة البيانات: {total_count}")
        
        # عرض عينة من الزبائن
        cursor.execute("SELECT name, phone_number FROM customers LIMIT 10")
        sample_customers = cursor.fetchall()
        print("\nعينة من الزبائن المدرجين:")
        for i, (name, phone) in enumerate(sample_customers, 1):
            print(f"{i}. {name} - {phone}")
        
        conn.close()
        return inserted_count
        
    except Exception as e:
        print(f"خطأ في حفظ البيانات: {e}")
        return 0

if __name__ == "__main__":
    print("🔄 بدء استعادة بيانات الزبائن من ملفات Excel...")
    customers = restore_customers_from_excel()
    print("✅ تم الانتهاء من استعادة بيانات الزبائن!")