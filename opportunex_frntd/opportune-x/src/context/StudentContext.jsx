import { createContext, useContext, useState, useEffect } from "react";
import {
  getStudentProfile,
  saveStudentProfile,
  getStudentApplications,
  applyToOpportunity as postApplication,
  uploadStudentResume
} from "../services/studentService";
import toast from "react-hot-toast";


const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  /* ---------- CORE STATES ---------- */
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  /* ---------- EXTRA STATES ---------- */
  const [projects, setProjects] = useState([]);
  const [roadmap, setRoadmap] = useState([]);

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
    setRoadmap(safeParse("roadmap", []));
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

        // Populate resume if it exists in DB!
        if (profRes.data.resumePath) {
          const filename = profRes.data.resumePath.split(/[/\\]/).pop();
          // Defaulting to the backend API route if we know the domain, but using relative is better if possible.
          // However, API endpoint needs the full URL or proxy handled by vite.
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
      if (appRes.data) {
        setApplications(appRes.data);
        sessionStorage.setItem("applications", JSON.stringify(appRes.data));
      }
    } catch {
      // silently ignore — profile not yet created or network error
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

    const hasBasic =
      p.fullName &&
      p.email &&
      p.mobile &&
      p.degree;

    if (!hasBasic) return false;

    // Engineering logic
    if (p.degree === "B.Tech" || p.degree === "M.Tech" || p.degree === "Diploma") {
      return Boolean(p.branch && p.year);
    }

    // Non-engineering
    return Boolean(p.year || p.percentage);
  };

  const isProfileCompleteForApply = () => {
    return isProfileMandatoryComplete(profile) && Boolean(resume);
  };

  /* ---------- APPLICATIONS ---------- */
  const applyToOpportunity = async (opportunity) => {
    if (!isProfileCompleteForApply()) {
      toast.error("Complete profile and upload resume to apply");
      return;
    }

    try {
      const res = await postApplication(opportunity._id);

      const newApp = {
        _id: res.data.application._id,
        title: opportunity.title,
        company: opportunity.companyName,
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
    const newProject = {
      id: Date.now(),
      ...project,
      members: [],
    };

    const updated = [...projects, newProject];
    setProjects(updated);
    sessionStorage.setItem("projects", JSON.stringify(updated));

    addNotification(`New project created: ${project.title}`);
  };

  /* ---------- SKILL ROADMAP ---------- */
  const generateRoadmap = async (missingSkills, targetRole = "software-engineer") => {
    if (!missingSkills || missingSkills.length === 0) return;
    const loadingToast = toast.loading("Generating your skill roadmap with AI\u2026");
    try {
      const { default: api } = await import("../services/api");
      const res = await api.post("/student/roadmap/generate", {
        missingSkills,
        targetRole,
        studentProfile: {
          branch: profile?.branch || "",
          year: profile?.year || "",
          cgpa: profile?.cgpa || ""
        }
      });
      const generated = res.data?.roadmap || [];
      setRoadmap(generated);
      sessionStorage.setItem("roadmap", JSON.stringify(generated));
      toast.success("\u2728 Skill roadmap ready! Check Skill Pathways.", { id: loadingToast });
      addNotification("Skill roadmap generated");
    } catch (err) {
      console.error("Roadmap generation error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to generate skill roadmap", { id: loadingToast });
    }
  };

  const updateRoadmapStatus = (skill, status) => {
    const updated = roadmap.map((r) =>
      r.skill === skill ? { ...r, status } : r
    );

    setRoadmap(updated);
    sessionStorage.setItem("roadmap", JSON.stringify(updated));
  };

  /* ---------- NOTIFICATIONS ---------- */
  const addNotification = (message) => {
    const notif = {
      id: Date.now(),
      message,
      time: new Date().toLocaleString(),
    };

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
        roadmap,
        resume,
        isFirstLogin,
        updateProfile,
        updateResume,
        applyToOpportunity,
        addProject,
        generateRoadmap,
        updateRoadmapStatus,
        isProfileMandatoryComplete,
        isProfileCompleteForApply,
        refreshStudentData: fetchInitialData,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);
