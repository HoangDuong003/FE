import React from 'react';
import GioithieuUrban1 from '../assets/images/GioithieuUrban_1.png';
import styles from './UrVN.module.css';

const UrVN = () => (
    <div className={styles.container}>
        <h1 className={styles.title}>
            GIỚI THIỆU VỀ CÔNG TY TNHH URBAN VIETNAM
        </h1>
        <div className={styles.subtitle}>
            [Chúng tôi Công ty TNHH Urban Việt Nam]
        </div>
        <div className={styles.description}>
            Nơi đào tạo nâng cao các tân kĩ sư chuyên ngành công nghệ IT để có thể thúc đẩy bản thân tiến lên phía trước, hòa nhập vào sự phát triển của thời đại công nghệ cao của thế giới và tạo ra những điều khác biệt cho bản thân.
        </div>
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img
                    src={GioithieuUrban1}
                    alt="Giới thiệu Urban Vietnam"
                    className={styles.image}
                />
            </div>
        </div>
    </div>
);

export default UrVN;
