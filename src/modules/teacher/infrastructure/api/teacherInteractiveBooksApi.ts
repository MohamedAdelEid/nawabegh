/**
 * Teacher interactive books API (`TEACHER_INTERACTIVE_BOOKS_API.md`).
 * Teachers use the same `/api/v1/InteractiveBook` and `/api/v1/Hotspot` routes as admin,
 * scoped server-side to the logged-in teacher's courses.
 */
export {
  createInteractiveBook,
  deleteInteractiveBook,
  generateInteractiveBookIndex,
  getInteractiveBookByCourseId,
  getInteractiveBookIndex,
  getInteractiveBooks,
  updateInteractiveBook,
  mapInteractiveBookStatus,
  type CreateInteractiveBookPayload,
  type GetInteractiveBooksParams,
  type InteractiveBookIndexData,
  type InteractiveBookIndexItem,
  type InteractiveBookIndexStatus,
  type InteractiveBooksApiResult,
  type InteractiveBooksListData,
  type UpdateInteractiveBookPayload,
} from "@/modules/admin/infrastructure/api/interactiveBooksApi";

export {
  createHotspot,
  deleteHotspot,
  getHotspotsByInteractiveBookId,
  getHotspotsByPage,
  isHotspotVisibleToStudents,
  toggleHotspotActivation,
  updateHotspot,
  type CreateHotspotPayload,
  type HotspotActivationToggle,
  type HotspotApiResult,
  type InteractiveBookHotspot,
  type UpdateHotspotPayload,
} from "@/modules/admin/infrastructure/api/hotspotsApi";

export { uploadAdminFile as uploadInteractiveBookPdf } from "@/modules/admin/infrastructure/api/fileUploadApi";
export { fetchTeacherMyCoursesOptions } from "@/modules/teacher/infrastructure/api/teacherCoursesApi";
