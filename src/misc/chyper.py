from cryptography.fernet import Fernet

key = Fernet.generate_key()


def encrypt(passw):
    cipher_suite = Fernet(key)
    return (cipher_suite.encrypt(bytes(passw)))


def decrypt(passw):
    cipher_suite = Fernet(key)
    return (cipher_suite.decrypt(bytes(passw)))


if __name__ == '__main__':
    test = encrypt('test')
    print(test)
    print(decrypt(test))
