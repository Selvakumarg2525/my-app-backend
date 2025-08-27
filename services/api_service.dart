import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000'; // For Android emulator

  Future<Map<String, dynamic>> sendOtp(String phoneNumber) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/send-otp'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'phoneNumber': phoneNumber}),
      );
      return json.decode(response.body);
    } catch (e) {
      throw Exception('Failed to send OTP: $e');
    }
  }
  Future<Map<String, dynamic>> verifyOtp(
      String phoneNumber,
      String otp,
      ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phoneNumber': phoneNumber,
          'otp': otp,
        }),
      );
      return json.decode(response.body);
    } catch (e) {
      throw Exception('Failed to verify OTP: $e');
    }
  }


  Future<Map<String, dynamic>> registerUser(
      String userType,
      String phoneNumber,
      String name,
      String passkey,
      ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userType': userType,
          'phoneNumber': phoneNumber,
          'name': name,
          'passkey': passkey,
        }),
      );
      return json.decode(response.body);
    } catch (e) {
      throw Exception('Failed to register user: $e');
    }
  }
}