export const handleNewCollaboration = async () => {
  try {
    const res = await fetch("/api/pages/duplicate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pageId: page.id }), // Send current page ID to duplicate
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      const newLink = `${window.location.origin}/page/${data.newPageId}?access=edit`;
      navigator.clipboard.writeText(newLink);
      alert("New collaboration link copied! Share it with your team.");
    } else {
      alert("Failed to create new collaboration session");
    }
  } catch (err) {
    console.error("Error creating new collaboration session:", err);
  }
};
