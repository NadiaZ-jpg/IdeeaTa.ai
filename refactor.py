import sys

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Widen containers
content = content.replace('className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-10 print:hidden"', 'className="w-full max-w-[98%] xl:max-w-[120rem] animate-in fade-in slide-in-from-bottom-10 print:hidden px-4 2xl:px-8"')
content = content.replace('className="w-full max-w-6xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10"', 'className="w-full max-w-[98%] xl:max-w-[120rem] px-4 2xl:px-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-10"')

# 2. Extract Sidebar
start_marker = '<div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-xl sticky top-8">'
start_idx = content.find(start_marker)
outer_start = content.rfind('<div className="flex flex-col gap-6">', 0, start_idx)

depth = 0
outer_end = outer_start
for i in range(outer_start, len(content)):
    if content.startswith('<div', i):
        depth += 1
    elif content.startswith('</div', i):
        depth -= 1
        if depth == 0:
            outer_end = i + 6
            break

sidebar_jsx = content[outer_start:outer_end]
content = content[:outer_start] + "{renderSidebar()}" + content[outer_end:]

content = content.replace('<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">', '<div className="flex flex-col lg:flex-row gap-8 items-start w-full">')
content = content.replace('<div className="lg:col-span-2 bg-[#09090b] border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl">', '<div className="w-full lg:w-3/5 xl:w-2/3">')
content = content.replace('<EditForm result={result} updateField={updateField} />', '<EditForm result={result} updateField={updateField} removeField={removeField} />')

return_idx = content.find('  return (\n')
render_fn = f"""  const renderSidebar = () => (
    <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col gap-6 sticky top-8 print:hidden">
      {sidebar_jsx[len('<div className="flex flex-col gap-6">'):-6]}
    </div>
  );

"""
content = content[:return_idx] + render_fn + content[return_idx:]

# 3. Add renderSidebar to Presentation view
replace_brochure = """          <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
            <div className="w-full lg:w-3/5 xl:w-2/3">
              <div ref={brochureRef} className={`${isEditing || viewHash === '#edit' || viewHash === '' ? 'hidden' : 'block'} bg-[#09090b] border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl transition-all duration-500`}>"""
content = content.replace("""          <div ref={brochureRef} className={`${isEditing ? 'hidden' : 'block'} bg-[#09090b] border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl transition-all duration-500`}>""", replace_brochure)

replace_target = """            )}
            
          </div>
        </div>
      )}"""
replace_with = """            )}
            
              </div>
            </div>
            {renderSidebar()}
          </div>
        </div>
      )}"""
content = content.replace(replace_target, replace_with)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
