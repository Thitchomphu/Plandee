export function authErrorMessage(error: { message: string } | null | undefined): string {
  if (!error) return '';
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
  if (message.includes('email not confirmed')) return 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ';
  if (message.includes('user already registered')) return 'อีเมลนี้ถูกใช้งานแล้ว';
  if (message.includes('password should be')) return 'รหัสผ่านสั้นเกินไป กรุณาใช้รหัสผ่านอย่างน้อย 6 ตัวอักษร';
  if (message.includes('email rate limit') || message.includes('rate limit')) return 'ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
  if (message.includes('network') || message.includes('fetch')) return 'เชื่อมต่ออินเทอร์เน็ตไม่ได้ กรุณาตรวจสอบการเชื่อมต่อ';
  if (message.includes('cancel')) return 'ยกเลิกการเข้าสู่ระบบ';
  return 'ทำรายการไม่สำเร็จ กรุณาลองอีกครั้ง';
}
