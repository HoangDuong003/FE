import React from 'react';
import Urhistory from '../assets/images/ForUrbanCor/Urhistory.jpg';
import Urlocation from '../assets/images/ForUrbanCor/Urlocation.jpg';
import UrOrganization from '../assets/images/ForUrbanCor/UrOrganization.jpg';
import UrEvent from '../assets/images/ForUrbanCor/UrEvent.jpg';
import UrYokohama from '../assets/images/ForUrbanCor/UrYokohama.jpg';
import Urlotrinh from '../assets/images/ForUrbanCor/Urlotrinh.jpg';
import Urchedo from '../assets/images/ForUrbanCor/Urchedo.jpg';
import styles from './UrCor.module.css';

const UrCor = () => (
    <div className={styles.container}>
        <h1 className={styles.mainTitle}>
            GIỚI THIỆU VỀ URBAN CORPORATION
        </h1>
        <div className={styles.subtitle}>
            [GIỚI THIỆU VỀ URBAN CORPORATION]
        </div>
        <div className={styles.intro}>
            Urban Corporation là công ty mẹ của Urban Việt Nam, chuyên đào tạo và phát triển nguồn nhân lực IT cho thị trường Nhật Bản. Chúng tôi cung cấp môi trường làm việc chuyên nghiệp, cơ hội phát triển bản thân và chế độ đãi ngộ hấp dẫn.
        </div>
        <div className={styles.card}>
            <h2 className={styles.sectionTitle}>
                LỊCH SỬ HÌNH THÀNH
            </h2>
            <p className={styles.paragraph}>
                Urban Corporation được thành lập với sứ mệnh đào tạo và phát triển nguồn nhân lực IT chất lượng cao cho thị trường Nhật Bản. Với kinh nghiệm nhiều năm trong lĩnh vực công nghệ thông tin, chúng tôi tự hào là đối tác tin cậy của nhiều doanh nghiệp lớn tại Nhật Bản.
            </p>
            <img src={Urhistory} alt="Lịch sử Urban Corporation" className={styles.image} />

            <h2 className={styles.sectionTitle}>
                ĐỊA ĐIỂM TRỤ SỞ
            </h2>
            <p className={styles.paragraph}>
                Trụ sở chính của Urban Corporation đặt tại Nhật Bản, với các chi nhánh và văn phòng đại diện tại nhiều thành phố lớn. Chúng tôi cung cấp môi trường làm việc hiện đại, chuyên nghiệp và đầy đủ tiện nghi cho nhân viên.
            </p>
            <img src={Urlocation} alt="Địa điểm trụ sở" className={styles.image} />

            <h2 className={styles.sectionTitle}>
                TỔ CHỨC VÀ HOẠT ĐỘNG
            </h2>
            <p className={styles.paragraph}>
                Urban Corporation tổ chức nhiều hoạt động ngoại khóa và sự kiện team building để tăng cường tinh thần đoàn kết và sự gắn bó giữa các thành viên. Chúng tôi cũng là nhà tài trợ chính thức cho đội bóng YOKOHAMA, thể hiện cam kết của chúng tôi trong việc phát triển cộng đồng.
            </p>
            <div className={styles.imageGallery}>
                <img src={UrOrganization} alt="Tổ chức Urban Corporation" className={styles.galleryImage} />
                <img src={UrEvent} alt="Hoạt động ngoại khóa" className={styles.galleryImage} />
                <img src={UrYokohama} alt="Đội bóng YOKOHAMA" className={styles.galleryImage} />
            </div>

            <h2 className={styles.sectionTitle}>
                LỘ TRÌNH ĐÀO TẠO
            </h2>
            <p className={styles.paragraph}>
                Chúng tôi cung cấp chương trình đào tạo toàn diện bao gồm:
            </p>
            <ul className={styles.list}>
                <li>Đào tạo chuyên môn IT</li>
                <li>Đào tạo tiếng Nhật (yêu cầu tối thiểu N3)</li>
                <li>Đào tạo kỹ năng mềm và văn hóa doanh nghiệp</li>
                <li>Cơ hội thực tập và làm việc tại Nhật Bản</li>
            </ul>
            <img src={Urlotrinh} alt="Lộ trình đào tạo" className={styles.image} />

            <h2 className={styles.sectionTitle}>
                CHẾ ĐỘ VÀ ĐIỀU KIỆN GIA NHẬP
            </h2>
            <p className={styles.paragraph}>
                Urban Corporation cung cấp chế độ đãi ngộ hấp dẫn bao gồm:
            </p>
            <ul className={styles.list}>
                <li>Mức lương cạnh tranh</li>
                <li>Bảo hiểm y tế và các chế độ phúc lợi</li>
                <li>Cơ hội thăng tiến rõ ràng</li>
                <li>Môi trường làm việc quốc tế</li>
            </ul>
            <p className={styles.paragraph}>
                Điều kiện gia nhập:
            </p>
            <ul className={styles.list}>
                <li>Trình độ tiếng Nhật tối thiểu N3</li>
                <li>Kiến thức chuyên môn IT</li>
                <li>Tinh thần học hỏi và cầu tiến</li>
                <li>Khả năng làm việc nhóm tốt</li>
            </ul>
            <img src={Urchedo} alt="Chế độ và điều kiện gia nhập" className={styles.galleryImage} />
        </div>
    </div>
);

export default UrCor;
