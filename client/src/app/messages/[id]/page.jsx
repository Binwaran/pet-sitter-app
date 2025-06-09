useEffect(() => {
  if (!user || !id) return;

  const fetchChatData = async () => {
    try {
      // 1. ดึงข้อความ
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      if (msgError) throw msgError
      setMessages(messagesData ?? [])

      // 2. ดึงข้อมูล user ฝั่งตรงข้าม
      if (id !== user.id.toString()) {
        const { data: userData, error: userErr } = await supabase
          .from('users')
          .select('id, name, profile_image_url')
          .eq('id', id)
          .single()

        if (userErr) throw userErr
        setOtherUser(userData)
      } else {
        setOtherUser(user)
      }

      // 3. ดึงรายชื่อคนเคยแชทด้วย
      const { data: chatData, error: chatErr } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

      if (chatErr) throw chatErr
      setChatList(chatData || [])

    } catch (err) {
      console.error("❌ fetchChatData failed:", err)
    }
  }

  fetchChatData()
}, [id, user])
