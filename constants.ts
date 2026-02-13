
import { RelaxActivity } from './types';

export const INITIAL_RELAX_ACTIVITIES: RelaxActivity[] = [
  { id: '1', title: 'Bóng rổ', description: 'Tăng chiều cao, sức bền và khả năng phối hợp đồng đội.', icon: 'fa-basketball' },
  { id: '2', title: 'Bơi lội', description: 'Giảm stress, rèn luyện hệ hô hấp và tim mạch cực tốt.', icon: 'fa-person-swimming' },
  { id: '3', title: 'Nghe nhạc', description: 'Thư giãn não bộ, tăng cường sóng não alpha giúp bình tĩnh.', icon: 'fa-music' },
  { id: '4', title: 'Ca hát', description: 'Giải phóng endorphin, tăng cường sự tự tin và hơi thở.', icon: 'fa-microphone-lines' },
  { id: '5', title: 'Nhảy múa', description: 'Đốt cháy calo, cải thiện tâm trạng và sự linh hoạt.', icon: 'fa-child-reaching' },
  { id: '6', title: 'Nhạc cụ', description: 'Tăng cường sự tập trung và khả năng sáng tạo tư duy.', icon: 'fa-guitar' },
];

export const STUDY_SYSTEM_INSTRUCTION = `
Bạn là MindStudy AI, một chuyên gia tư vấn học thuật hàng đầu. 
Nhiệm vụ của bạn là dựa trên hồ sơ học sinh (Lớp, Thế mạnh, Yếu điểm, Thách thức, Mục tiêu) và kết quả của 8 câu hỏi trắc nghiệm tâm lý học tập để tạo ra một lộ trình học tập 4 bước (roadmap) cá nhân hóa.

Yêu cầu định dạng phản hồi:
1. Trả về một đối tượng JSON duy nhất.
2. Roadmap: Mảng gồm 4 nút, mỗi nút có 'title' (tiêu đề ngắn) và 'content' (nội dung chi tiết).
3. Summary: Một đoạn tóm tắt giải pháp tổng quát ngắn gọn, súc tích.
4. Advice: Lời khuyên chuyên sâu để giải quyết thách thức cụ thể của học sinh.
5. motivationalQuote: Một câu danh ngôn truyền cảm hứng bằng tiếng Việt phù hợp với tình trạng của họ.

Phản hồi PHẢI là JSON hợp lệ. Trả lời bằng tiếng Việt thân thiện, khích lệ.
`;
