#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
مُستعيد البيانات من النسخة الاحتياطية SQL إلى قاعدة بيانات SQLite
Data Restore Script from SQL Backup to SQLite Database
"""

import re
import json
import sqlite3
from datetime import datetime
from typing import List, Dict, Tuple, Optional

class DataRestorer:
    def __init__(self, backup_file: str, sqlite_db: str):
        self.backup_file = backup_file
        self.sqlite_db = sqlite_db
        self.customers_data = []
        self.cars_data = []
        self.receipts_data = []
        
    def read_backup_file(self) -> str:
        """قراءة ملف النسخة الاحتياطية"""
        print("📖 قراءة ملف النسخة الاحتياطية...")
        with open(self.backup_file, 'r', encoding='utf-8') as f:
            return f.read()
    
    def extract_customers_data(self, content: str) -> List[Dict]:
        """استخراج بيانات الزبائن"""
        print("👥 استخراج بيانات الزبائن...")
        customers = []
        
        # البحث عن بيانات الزبائن في النسخة الاحتياطية
        customers_section = re.search(
            r'COPY public\.customers.*?FROM stdin;(.*?)\\\.', 
            content, 
            re.DOTALL
        )
        
        if not customers_section:
            print("❌ لم يتم العثور على بيانات الزبائن")
            return []
        
        lines = customers_section.group(1).strip().split('\n')
        
        for line in lines:
            if line.strip() and not line.startswith('--'):
                # تقسيم السطر باستخدام Tab
                parts = line.split('\t')
                if len(parts) >= 4:
                    try:
                        customer = {
                            'old_id': int(parts[0]),
                            'name': parts[1].strip(),
                            'phone_number': parts[2].strip(),
                            'location': parts[3].strip() if parts[3] != '\\N' else None,
                            'notes': parts[4].strip() if len(parts) > 4 and parts[4] != '\\N' else None,
                            'created_at': datetime.now().isoformat()
                        }
                        customers.append(customer)
                        print(f"✅ تم استخراج: {customer['name']} - {customer['phone_number']}")
                    except (ValueError, IndexError) as e:
                        print(f"⚠️  خطأ في تحليل السطر: {line[:50]}... - {e}")
        
        print(f"📊 تم استخراج {len(customers)} زبون")
        self.customers_data = customers
        return customers
    
    def extract_cars_data(self, content: str) -> List[Dict]:
        """استخراج بيانات السيارات"""
        print("🚗 استخراج بيانات السيارات...")
        cars = []
        
        # البحث عن بيانات السيارات في النسخة الاحتياطية
        cars_section = re.search(
            r'COPY public\.customer_cars.*?FROM stdin;(.*?)\\\.', 
            content, 
            re.DOTALL
        )
        
        if not cars_section:
            print("❌ لم يتم العثور على بيانات السيارات")
            return []
        
        lines = cars_section.group(1).strip().split('\n')
        
        for line in lines:
            if line.strip() and not line.startswith('--'):
                # تقسيم السطر باستخدام Tab
                parts = line.split('\t')
                if len(parts) >= 5:
                    try:
                        car = {
                            'old_id': int(parts[0]),
                            'old_customer_id': int(parts[1]),
                            'car_brand': parts[2].strip(),
                            'car_model': parts[3].strip(), 
                            'license_plate': parts[4].strip(),
                            'color': parts[5].strip() if len(parts) > 5 and parts[5] != '\\N' else None,
                            'year': int(parts[6]) if len(parts) > 6 and parts[6] != '\\N' and parts[6].isdigit() else None,
                            'notes': parts[7].strip() if len(parts) > 7 and parts[7] != '\\N' else None,
                            'engine_code': parts[9].strip() if len(parts) > 9 and parts[9] != '\\N' else None,
                            'chassis_number': parts[10].strip() if len(parts) > 10 and parts[10] != '\\N' else None,
                            'previous_owner': parts[11].strip() if len(parts) > 11 and parts[11] != '\\N' else None,
                            'created_at': datetime.now().isoformat()
                        }
                        cars.append(car)
                        print(f"✅ تم استخراج: {car['car_brand']} {car['car_model']} - {car['license_plate']}")
                    except (ValueError, IndexError) as e:
                        print(f"⚠️  خطأ في تحليل السطر: {line[:50]}... - {e}")
        
        print(f"📊 تم استخراج {len(cars)} سيارة")
        self.cars_data = cars
        return cars
    
    def extract_receipts_data(self, content: str) -> List[Dict]:
        """استخراج بيانات إيصالات السيارات"""
        print("🧾 استخراج بيانات إيصالات السيارات...")
        receipts = []
        
        # البحث عن بيانات الإيصالات في النسخة الاحتياطية
        receipts_section = re.search(
            r'COPY public\.car_receipts.*?FROM stdin;(.*?)\\\.', 
            content, 
            re.DOTALL
        )
        
        if not receipts_section:
            print("❌ لم يتم العثور على بيانات الإيصالات")
            return []
        
        lines = receipts_section.group(1).strip().split('\n')
        
        for line in lines:
            if line.strip() and not line.startswith('--'):
                # تقسيم السطر باستخدام Tab
                parts = line.split('\t')
                if len(parts) >= 12:
                    try:
                        receipt = {
                            'old_id': int(parts[0]),
                            'receipt_number': parts[1].strip(),
                            'license_plate': parts[2].strip(),
                            'customer_name': parts[3].strip(),
                            'car_brand': parts[4].strip(),
                            'car_model': parts[5].strip(),
                            'car_color': parts[6].strip() if parts[6] != '\\N' else None,
                            'chassis_number': parts[7].strip() if parts[7] != '\\N' else None,
                            'engine_code': parts[8].strip() if parts[8] != '\\N' else None,
                            'entry_mileage': parts[9].strip(),
                            'fuel_level': parts[10].strip(),
                            'entry_notes': parts[11].strip() if parts[11] != '\\N' else None,
                            'repair_type': parts[12].strip(),
                            'received_by': parts[13].strip(),
                            'received_at': parts[14].strip() if len(parts) > 14 else datetime.now().isoformat(),
                            'status': parts[15].strip() if len(parts) > 15 else 'received',
                            'created_at': datetime.now().isoformat()
                        }
                        receipts.append(receipt)
                        print(f"✅ تم استخراج إيصال: {receipt['receipt_number']} - {receipt['customer_name']}")
                    except (ValueError, IndexError) as e:
                        print(f"⚠️  خطأ في تحليل السطر: {line[:50]}... - {e}")
        
        print(f"📊 تم استخراج {len(receipts)} إيصال")
        self.receipts_data = receipts
        return receipts
    
    def connect_to_sqlite(self) -> sqlite3.Connection:
        """الاتصال بقاعدة بيانات SQLite"""
        print(f"🔗 الاتصال بقاعدة البيانات: {self.sqlite_db}")
        conn = sqlite3.connect(self.sqlite_db)
        conn.row_factory = sqlite3.Row
        return conn
    
    def insert_customers(self, conn: sqlite3.Connection) -> Dict[int, int]:
        """إدراج الزبائن في قاعدة البيانات وإرجاع خريطة المعرفات"""
        print("💾 إدراج بيانات الزبائن...")
        cursor = conn.cursor()
        old_to_new_id_map = {}
        
        for customer in self.customers_data:
            try:
                cursor.execute("""
                    INSERT INTO customers (name, phone_number, location, notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    customer['name'],
                    customer['phone_number'], 
                    customer['location'],
                    customer['notes'],
                    customer['created_at'],
                    customer['created_at']
                ))
                
                new_id = cursor.lastrowid
                old_to_new_id_map[customer['old_id']] = new_id
                print(f"✅ تم إدراج الزبون: {customer['name']} (ID: {customer['old_id']} -> {new_id})")
                
            except sqlite3.Error as e:
                print(f"❌ خطأ في إدراج الزبون {customer['name']}: {e}")
        
        conn.commit()
        print(f"💾 تم إدراج {len(old_to_new_id_map)} زبون بنجاح")
        return old_to_new_id_map
    
    def insert_cars(self, conn: sqlite3.Connection, customer_id_map: Dict[int, int]):
        """إدراج السيارات في قاعدة البيانات"""
        print("💾 إدراج بيانات السيارات...")
        cursor = conn.cursor()
        inserted_count = 0
        
        for car in self.cars_data:
            try:
                # الحصول على معرف الزبون الجديد
                new_customer_id = customer_id_map.get(car['old_customer_id'])
                if not new_customer_id:
                    print(f"⚠️  لم يتم العثور على الزبون بالمعرف {car['old_customer_id']} للسيارة {car['car_brand']} {car['car_model']}")
                    continue
                
                cursor.execute("""
                    INSERT INTO customer_cars 
                    (customer_id, car_brand, car_model, license_plate, chassis_number, 
                     engine_code, year, color, notes, previous_owner, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    new_customer_id,
                    car['car_brand'],
                    car['car_model'],
                    car['license_plate'],
                    car['chassis_number'],
                    car['engine_code'],
                    car['year'],
                    car['color'],
                    car['notes'],
                    car['previous_owner'],
                    car['created_at'],
                    car['created_at']
                ))
                
                inserted_count += 1
                print(f"✅ تم إدراج السيارة: {car['car_brand']} {car['car_model']} - {car['license_plate']}")
                
            except sqlite3.Error as e:
                print(f"❌ خطأ في إدراج السيارة {car['car_brand']} {car['car_model']}: {e}")
        
        conn.commit()
        print(f"💾 تم إدراج {inserted_count} سيارة بنجاح")
    
    def insert_receipts(self, conn: sqlite3.Connection):
        """إدراج إيصالات السيارات في قاعدة البيانات"""
        print("💾 إدراج بيانات إيصالات السيارات...")
        cursor = conn.cursor()
        inserted_count = 0
        
        for receipt in self.receipts_data:
            try:
                cursor.execute("""
                    INSERT INTO car_receipts 
                    (receipt_number, license_plate, customer_name, car_brand, car_model, 
                     car_color, chassis_number, engine_code, entry_mileage, fuel_level, 
                     entry_notes, repair_type, received_by, received_at, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    receipt['receipt_number'],
                    receipt['license_plate'],
                    receipt['customer_name'],
                    receipt['car_brand'],
                    receipt['car_model'],
                    receipt['car_color'],
                    receipt['chassis_number'],
                    receipt['engine_code'],
                    receipt['entry_mileage'],
                    receipt['fuel_level'],
                    receipt['entry_notes'],
                    receipt['repair_type'],
                    receipt['received_by'],
                    receipt['received_at'],
                    receipt['status'],
                    receipt['created_at']
                ))
                
                inserted_count += 1
                print(f"✅ تم إدراج الإيصال: {receipt['receipt_number']} - {receipt['customer_name']}")
                
            except sqlite3.Error as e:
                print(f"❌ خطأ في إدراج الإيصال {receipt['receipt_number']}: {e}")
        
        conn.commit()
        print(f"💾 تم إدراج {inserted_count} إيصال بنجاح")
    
    def verify_data(self, conn: sqlite3.Connection):
        """التحقق من البيانات المدرجة"""
        print("🔍 التحقق من البيانات المدرجة...")
        cursor = conn.cursor()
        
        # عدد الزبائن
        cursor.execute("SELECT COUNT(*) FROM customers")
        customers_count = cursor.fetchone()[0]
        print(f"👥 عدد الزبائن: {customers_count}")
        
        # عدد السيارات
        cursor.execute("SELECT COUNT(*) FROM customer_cars")
        cars_count = cursor.fetchone()[0]
        print(f"🚗 عدد السيارات: {cars_count}")
        
        # عدد الإيصالات
        cursor.execute("SELECT COUNT(*) FROM car_receipts")
        receipts_count = cursor.fetchone()[0]
        print(f"🧾 عدد الإيصالات: {receipts_count}")
        
        # عرض بعض الأمثلة
        print("\n📋 أمثلة على البيانات المدرجة:")
        
        cursor.execute("SELECT name, phone_number FROM customers LIMIT 5")
        customers_sample = cursor.fetchall()
        for customer in customers_sample:
            print(f"   👤 {customer[0]} - {customer[1]}")
        
        cursor.execute("""
            SELECT c.name, cc.car_brand, cc.car_model, cc.license_plate 
            FROM customers c 
            JOIN customer_cars cc ON c.id = cc.customer_id 
            LIMIT 5
        """)
        cars_sample = cursor.fetchall()
        for car in cars_sample:
            print(f"   🚙 {car[0]} - {car[1]} {car[2]} ({car[3]})")
    
    def restore_all(self):
        """تشغيل عملية الاستعادة الكاملة"""
        print("🚀 بدء عملية استعادة البيانات...")
        print("=" * 50)
        
        try:
            # قراءة النسخة الاحتياطية
            content = self.read_backup_file()
            
            # استخراج البيانات
            self.extract_customers_data(content)
            self.extract_cars_data(content)
            self.extract_receipts_data(content)
            
            # الاتصال بقاعدة البيانات
            conn = self.connect_to_sqlite()
            
            # إدراج البيانات
            customer_id_map = self.insert_customers(conn)
            self.insert_cars(conn, customer_id_map)
            self.insert_receipts(conn)
            
            # التحقق من البيانات
            self.verify_data(conn)
            
            conn.close()
            
            print("=" * 50)
            print("✅ تمت عملية الاستعادة بنجاح!")
            print(f"📊 المجموع: {len(self.customers_data)} زبون، {len(self.cars_data)} سيارة، {len(self.receipts_data)} إيصال")
            
        except Exception as e:
            print(f"❌ خطأ عام في عملية الاستعادة: {e}")
            raise

def main():
    """الدالة الرئيسية"""
    backup_file = "backup_20250809_120208.sql"
    sqlite_db = "v-power-tuning.db"
    
    print("🔧 مُستعيد بيانات V-POWER TUNING")
    print("=" * 50)
    
    restorer = DataRestorer(backup_file, sqlite_db)
    restorer.restore_all()

if __name__ == "__main__":
    main()