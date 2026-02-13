
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
You are MindStudy AI, a world-class academic advisor. 
Based on the student's profile (Grade, Strengths, Weaknesses, Challenges, Goals), generate a personalized 4-node study roadmap in JSON format.
Include:
1. Roadmap: Array of 4 nodes with 'title' and 'content'.
2. Summary: A short motivational summary.
3. Advice: Expert advice for their specific challenges.
Response MUST be strictly valid JSON.
`;
