import { createContext, useContext, useState, useEffect } from "react";
import {
  getStudentProfile,
  saveStudentProfile,
  getStudentApplications,
  applyToOpportunity as postApplication,
  uploadStudentResume
} from "../services/studentService";
import toast from '../components/common/toastManager';


const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  /* ---------- CORE STATES ---------- */
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  /* ---------- EXTRA STATES ---------- */
  const [projects, setProjects] = useState([]);
  const [roadmaps, setRoadmaps] = useState({});

  /* ---------- RESUME ---------- */
  const [resume, setResume] = useState(null);

  /* ---------- FIRST LOGIN ---------- */
  const [isFirstLogin, setIsFirstLogin] = useState(true);

  /* ---------- LOAD FROM SESSION STORAGE ---------- */
  useEffect(() => {
    const safeParse = (key, defaultVal) => {
      try {
        const val = sessionStorage.getItem(key);
        if (!val || val === "undefined" || val === "null") return defaultVal;
        const parsed = JSON.parse(val);
        return parsed || defaultVal;
      } catch (e) {
        return defaultVal;
      }
    };

    setProfile(safeParse("studentProfile", null));
    setApplications(safeParse("applications", []));
    setNotifications(safeParse("notifications", []));
    setProjects(safeParse("projects", []));
    setRoadmaps(safeParse("roadmaps", {}));
    setResume(safeParse("resume", null));

    if (sessionStorage.getItem("isFirstLogin") === "false") {
      setIsFirstLogin(false);
    }
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch Profile
      const profRes = await getStudentProfile();
      if (profRes.data) {
        setProfile(profRes.data);
        sessionStorage.setItem("studentProfile", JSON.stringify(profRes.data));
        setResume(profRes.data.resumePath || profRes.data.resume || null);

        // Populate resume if it exists in DB!
        if (profRes.data.resumePath) {
          const filename = profRes.data.resumePath.split(/[/\\]/).pop();
          const { default: api } = await import("../services/api");
          const previewUrl = `${api.defaults.baseURL}/student/resume/view/${filename}`;

          const r = { name: filename, size: 0, previewUrl };
          setResume(r);
          sessionStorage.setItem("resume", JSON.stringify(r));
        }

        setIsFirstLogin(false);
      }

      // Fetch Applications
      const appRes = await getStudentApplications();
      if (appRes.data && appRes.data.applications) {
        setApplications(appRes.data.applications);
        sessionStorage.setItem("applications", JSON.stringify(appRes.data.applications));
      } else if (Array.isArray(appRes.data)) {
        setApplications(appRes.data);
        sessionStorage.setItem("applications", JSON.stringify(appRes.data));
      }

      // Fetch Roadmaps
      try {
        const { default: api } = await import("../services/api");
        const roadmapRes = await api.get("/student/roadmap/all");
        if (roadmapRes.data && roadmapRes.data.roadmaps) {
          const rmap = {};
          roadmapRes.data.roadmaps.forEach(r => {
            rmap[r.opportunityId?._id || r._id || "general"] = r;
          });
          setRoadmaps(rmap);
          sessionStorage.setItem("roadmaps", JSON.stringify(rmap));
        }
      } catch (err) {}
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);


  /* ---------- PROFILE ---------- */
  const updateProfile = async (data) => {
    try {
      const res = await saveStudentProfile(data);
      setProfile(res.data);
      sessionStorage.setItem("studentProfile", JSON.stringify(res.data));
      setResume(res.data.resumePath || res.data.resume || null);
      if (isProfileMandatoryComplete(res.data)) {
        setIsFirstLogin(false);
        sessionStorage.setItem("isFirstLogin", "false");
      }
      addNotification("Profile updated successfully");
    } catch (err) {
      console.error(err);
      addNotification("Failed to update profile");
      throw err;
    }
  };


  /* ---------- RESUME ---------- */
  const updateResume = async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    const res = await uploadStudentResume(formData);
    const resumeData = {
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file)
    };
    setResume(resumeData);
    sessionStorage.setItem("resume", JSON.stringify(resumeData));
    if (profile) {
      const updatedProfile = { ...profile, resumePath: res.data.resumePath };
      setProfile(updatedProfile);
      sessionStorage.setItem("studentProfile", JSON.stringify(updatedProfile));
    }
    addNotification("Resume uploaded successfully");
  };

  /* ---------- PROFILE COMPLETENESS ---------- */
  const isProfileMandatoryComplete = (p = profile) => {
    if (!p) return false;
    const hasBasic = p.fullName && p.email && p.mobile && p.degree;
    if (!hasBasic) return false;
    if (p.degree === "B.Tech" || p.degree === "M.Tech" || p.degree === "Diploma") {
      return Boolean(p.branch && p.year);
    }
    return Boolean(p.year || p.percentage);
  };

  const isProfileCompleteForApply = () => {
    return isProfileMandatoryComplete(profile) && Boolean(resume);
  };

  /* ---------- APPLICATIONS ---------- */
  const applyToOpportunity = async (opportunity, submittedData = {}) => {
    if (!isProfileCompleteForApply()) {
      toast.error("Complete profile and upload resume to apply");
      return;
    }
    try {
      const payload = { opportunityId: opportunity._id, ...submittedData };
      const res = await postApplication(payload);
      const newApp = {
        _id: res.data.application._id,
        title: opportunity.title,
        company: opportunity.companyName,
        companyProfileId: opportunity.companyProfileId,
        status: "Applied",
        appliedAt: new Date()
      };
      const updatedApps = [newApp, ...applications];
      setApplications(updatedApps);
      sessionStorage.setItem("applications", JSON.stringify(updatedApps));
      toast.success(`Successfully applied to ${opportunity.title}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit application");
    }
  };

  /* ---------- TEAM FORMATION ---------- */
  const addProject = (project) => {
    const newProject = { id: Date.now(), ...project, members: [] };
    const updated = [...projects, newProject];
    setProjects(updated);
    sessionStorage.setItem("projects", JSON.stringify(updated));
    addNotification(`New project created: ${project.title}`);
  };

  /* ---------- SKILL ROADMAP ---------- */
  const generateRoadmap = async (missingSkills, targetRole = "software-engineer", opportunityId = null, companyName = "") => {
    if (!missingSkills || missingSkills.length === 0) return;
    const loadingToast = toast.loading("Generating your skill roadmap with AI\u2026");
    try {
      const { default: api } = await import("../services/api");
      const res = await api.post("/student/roadmap/generate", {
        missingSkills,
        targetRole,
        opportunityId,
        studentProfile: {
          branch: profile?.branch || "",
          year: profile?.year || "",
          cgpa: profile?.cgpa || ""
        }
      });
      const generatedDoc = res.data?.roadmapDoc || { roadmap: res.data?.roadmap || [] };
      
      // Patch local object proactively so UI is instantly perfect
      if (!generatedDoc.targetRole) generatedDoc.targetRole = targetRole;
      if (!generatedDoc.opportunityId && opportunityId) {
        generatedDoc.opportunityId = { _id: opportunityId, title: targetRole, companyName };
      }

      const oppKey = opportunityId || "general";
      setRoadmaps(prev => {
        const next = { ...prev, [oppKey]: generatedDoc };
        sessionStorage.setItem("roadmaps", JSON.stringify(next));
        return next;
      });
      toast.success("\u2728 Skill roadmap ready! Check Skill Pathways.", { id: loadingToast });
      addNotification("Skill roadmap generated");
    } catch (err) {
      console.error("Roadmap generation error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to generate skill roadmap", { id: loadingToast });
    }
  };

  const updateRoadmapStatus = (skill, status, opportunityId = "general") => {
    setRoadmaps(prev => {
      const oppDoc = prev[opportunityId] || { roadmap: [] };
      const updatedProg = oppDoc.roadmap.map((r) => r.skill === skill ? { ...r, status } : r);
      const next = { ...prev, [opportunityId]: { ...oppDoc, roadmap: updatedProg } };
      sessionStorage.setItem("roadmaps", JSON.stringify(next));
      return next;
    });
  };

  const deleteRoadmap = async (id) => {
    try {
      const { default: api } = await import("../services/api");
      await api.delete(`/roadmap/${id}`);
      setRoadmaps(prev => {
        const next = { ...prev };
        // Roadmaps is an object keyed by opportunityId or 'general'
        Object.keys(next).forEach(key => {
          if (next[key]._id === id) delete next[key];
        });
        sessionStorage.setItem("roadmaps", JSON.stringify(next));
        return next;
      });
      toast.success("Roadmap deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete roadmap");
      throw err;
    }
  };

  /* ---------- NOTIFICATIONS ---------- */
  const addNotification = (message) => {
    const notif = { id: Date.now(), message, time: new Date().toLocaleString() };
    const updated = [notif, ...notifications];
    setNotifications(updated);
    sessionStorage.setItem("notifications", JSON.stringify(updated));
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        applications,
        notifications,
        setNotifications,
        projects,
        roadmaps,
        resume,
        isFirstLogin,
        updateProfile,
        updateResume,
        applyToOpportunity,
        addProject,
        generateRoadmap,
        updateRoadmapStatus,
        deleteRoadmap,
        isProfileMandatoryComplete,
        isProfileCompleteForApply,
        refreshStudentData: fetchInitialData,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    console.warn("useStudent called outside provider. Returning safety mock.");
    return {
      profile: null,
      applications: [],
      notifications: [],
      projects: [],
      roadmaps: {},
      resume: null,
      updateProfile: async () => { },
      updateResume: async () => { },
      applyToOpportunity: async () => { },
      addProject: () => { },
      generateRoadmap: async () => { },
      updateRoadmapStatus: () => { },
      isProfileMandatoryComplete: () => false,
      isProfileCompleteForApply: () => false,
      refreshStudentData: async () => { },
    };
  }
  return context;
};
