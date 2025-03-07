import os
from cryptography.fernet import Fernet

class LogEncryptor:
    def __init__(self, key_file='encryption.key'):
        """
        Initialize encryption with a key file
        """
        self.key_file = key_file
        self.key = self.load_or_generate_key()
        self.cipher_suite = Fernet(self.key)
    
    def load_or_generate_key(self):
        """
        Load existing encryption key or generate a new one
        """
        if os.path.exists(self.key_file):
            with open(self.key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(self.key_file, 'wb') as f:
                f.write(key)
            return key
    
    def encrypt_log(self, log_data):
        """
        Encrypt log data
        """
        return self.cipher_suite.encrypt(log_data.encode())
    
    def decrypt_log(self, encrypted_data):
        """
        Decrypt log data
        """
        return self.cipher_suite.decrypt(encrypted_data).decode()
    
    def encrypt_file(self, input_file, output_file=None):
        """
        Encrypt an entire log file
        """
        if output_file is None:
            output_file = input_file + '.encrypted'
        
        with open(input_file, 'rb') as f:
            data = f.read()
        
        encrypted_data = self.cipher_suite.encrypt(data)
        
        with open(output_file, 'wb') as f:
            f.write(encrypted_data)
        
        return output_file

def main():
    # Example usage
    encryptor = LogEncryptor()
    sample_log = "Sensitive keystroke log data"
    encrypted_log = encryptor.encrypt_log(sample_log)
    decrypted_log = encryptor.decrypt_log(encrypted_log)
    
    print(f"Original: {sample_log}")
    print(f"Encrypted: {encrypted_log}")
    print(f"Decrypted: {decrypted_log}")

if __name__ == "__main__":
    main() 