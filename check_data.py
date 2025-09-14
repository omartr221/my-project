#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
التحقق من البيانات في قاعدة بيانات SQLite
Verify data in SQLite database
"""

import sqlite3
from datetime import datetime

def check_database():
    """التحقق من البيانات في قاعدة البيانات"""
    
    print("🔍 التحقق من البيانات في قاعدة البيانات SQLite...")
    print("=" * 50)
    
    # الاتصال بقاعدة البيانات
    try:
        conn = sqlite3.connect("v-power-tuning.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # التحقق من عدد الزبائن
        cursor.execute("SELECT COUNT(*) as count FROM customers")
        customers_count = cursor.fetchone()[0]
        print(f"👥 إجمالي الزبائن: {customers_count}")
        
        # التحقق من عدد السيارات
        cursor.execute("SELECT COUNT(*) as count FROM customer_cars")
        cars_count = cursor.fetchone()[0]
        print(f"🚗 إجمالي السيارات: {cars_count}")
        
        # التحقق من عدد الإيصالات
        cursor.execute("SELECT COUNT(*) as count FROM car_receipts")
        receipts_count = cursor.fetchone()[0]
        print(f"🧾 إجمالي الإيصالات: {receipts_count}")
        
        print("\n📋 عينة من الزبائن:")
        cursor.execute("SELECT id, name, phone_number FROM customers ORDER BY id LIMIT 10")
        customers = cursor.fetchall()
        for customer in customers:
            print(f"   {customer[0]}. {customer[1]} - {customer[2]}")
        
        print("\n🚙 عينة من السيارات مع أصحابها:")
        cursor.execute("""
            SELECT c.name, cc.car_brand, cc.car_model, cc.license_plate, cc.color
            FROM customers c 
            JOIN customer_cars cc ON c.id = cc.customer_id 
            ORDER BY c.id 
            LIMIT 10
        """)
        cars = cursor.fetchall()
        for car in cars:
            print(f"   {car[0]} - {car[1]} {car[2]} ({car[3]}) - {car[4] or 'غير محدد'}")
        
        print("\n🧾 عينة من الإيصالات:")
        cursor.execute("""
            SELECT receipt_number, customer_name, car_brand, car_model, status
            FROM car_receipts 
            ORDER BY id 
            LIMIT 5
        """)
        receipts = cursor.fetchall()
        for receipt in receipts:
            print(f"   {receipt[0]} - {receipt[1]} - {receipt[2]} {receipt[3]} ({receipt[4]})")
        
        # التحقق من أشهر العلامات التجارية
        print("\n📊 إحصائيات العلامات التجارية:")
        cursor.execute("""
            SELECT car_brand, COUNT(*) as count 
            FROM customer_cars 
            GROUP BY car_brand 
            ORDER BY count DESC
        """)
        brands = cursor.fetchall()
        for brand in brands:
            print(f"   {brand[0]}: {brand[1]} سيارة")
        
        # التحقق من الجداول الموجودة
        print("\n📋 الجداول الموجودة في قاعدة البيانات:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"   📊 {table[0]}: {count} سجل")
        
        conn.close()
        
        print("\n" + "=" * 50)
        print("✅ تم التحقق من البيانات بنجاح!")
        
        return {
            'customers': customers_count,
            'cars': cars_count,
            'receipts': receipts_count
        }
        
    except Exception as e:
        print(f"❌ خطأ في التحقق من البيانات: {e}")
        return None

def check_specific_customers():
    """التحقق من وجود زبائن محددين"""
    
    expected_customers = [
        "عادل الغفري", "طلال مخول", "محمد قاسم دياب", "سيف الدين المذيب", 
        "حسان ملوك", "محمد الجوجة", "احمد جنيد", "محمود ياسين", 
        "ايمن العويد", "رانية الشرابي", "فارس بدر", "رائد مشارقة"
    ]
    
    print("\n🔍 التحقق من وجود زبائن محددين:")
    print("-" * 30)
    
    try:
        conn = sqlite3.connect("v-power-tuning.db")
        cursor = conn.cursor()
        
        found_customers = []
        missing_customers = []
        
        for customer_name in expected_customers:
            cursor.execute("SELECT id, name, phone_number FROM customers WHERE name LIKE ?", (f"%{customer_name}%",))
            result = cursor.fetchone()
            
            if result:
                found_customers.append(customer_name)
                print(f"   ✅ {customer_name} - {result[2]}")
            else:
                missing_customers.append(customer_name)
                print(f"   ❌ {customer_name} - غير موجود")
        
        conn.close()
        
        print(f"\n📊 تم العثور على {len(found_customers)} من أصل {len(expected_customers)} زبون")
        if missing_customers:
            print(f"⚠️  الزبائن المفقودون: {', '.join(missing_customers)}")
        
        return found_customers, missing_customers
        
    except Exception as e:
        print(f"❌ خطأ في التحقق من الزبائن: {e}")
        return [], []

if __name__ == "__main__":
    print("🔧 فحص بيانات نظام V-POWER TUNING")
    print("تاريخ الفحص:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 50)
    
    # التحقق العام من البيانات
    check_database()
    
    # التحقق من زبائن محددين
    check_specific_customers()